// Obtener KPIs reales del dashboard (OPTIMIZADO: 5 consultas en lugar de 16)
const getDashboardKPIs = async (db) => {
  try {
    // Fechas para las consultas
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Mes anterior
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Fecha de hoy para citas
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    // Calcular el próximo día laborable
    const tomorrow = new Date(now);
    const currentDayOfWeek = now.getDay();
    
    if (currentDayOfWeek === 5) {
      tomorrow.setDate(tomorrow.getDate() + 3);
    } else if (currentDayOfWeek === 6) {
      tomorrow.setDate(tomorrow.getDate() + 2);
    } else {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    // ===== QUERY 1: MASTER SESSIONS QUERY (Unifica 7 consultas) =====
    const masterSessionsQuery = `
      WITH session_stats AS (
        SELECT 
          -- Datos básicos
          s.id,
          s.session_date,
          s.start_time,
          s.mode,
          s.status,
          s.price,
          s.payment_method,
          s.clinic_id,
          c.name as clinic_name,
          -- Mes y semana
          YEAR(s.session_date) as year,
          MONTH(s.session_date) as month,
          WEEK(s.session_date, 1) - WEEK(DATE_FORMAT(s.session_date, '%Y-%m-01'), 1) + 1 as week_number
        FROM sessions s
        INNER JOIN clinics c ON s.clinic_id = c.id AND c.is_active = true
        WHERE s.status IN ('completed', 'scheduled', 'cancelled', 'no-show')
      )
      SELECT 
        -- RapidKPI: Sesiones e ingresos mes actual
        COUNT(CASE WHEN year = ? AND month = ? AND status IN ('completed', 'scheduled') THEN 1 END) as current_month_sessions,
        COALESCE(SUM(CASE WHEN year = ? AND month = ? AND status IN ('completed', 'scheduled') THEN price END), 0) as current_month_revenue,
        
        -- RapidKPI: Sesiones e ingresos mes anterior
        COUNT(CASE WHEN year = ? AND month = ? AND status IN ('completed', 'scheduled') THEN 1 END) as previous_month_sessions,
        COALESCE(SUM(CASE WHEN year = ? AND month = ? AND status IN ('completed', 'scheduled') THEN price END), 0) as previous_month_revenue,
        
        -- RapidKPI: Próximas citas hoy
        COUNT(CASE WHEN session_date = ? AND status = 'scheduled' THEN 1 END) as today_scheduled_sessions,
        
        -- DistributionByModalityData
        COUNT(CASE WHEN mode = 'Presencial' AND status IN ('completed', 'scheduled') THEN 1 END) as presencial_count,
        COUNT(CASE WHEN mode = 'Online' AND status IN ('completed', 'scheduled') THEN 1 END) as online_count,
        
        -- PaymentMethodsData
        COUNT(CASE WHEN payment_method = 'cash' AND status IN ('completed', 'scheduled') THEN 1 END) as cash_count,
        COUNT(CASE WHEN payment_method = 'card' AND status IN ('completed', 'scheduled') THEN 1 END) as card_count,
        COUNT(CASE WHEN payment_method = 'transfer' AND status IN ('completed', 'scheduled') THEN 1 END) as transfer_count,
        COUNT(CASE WHEN payment_method = 'insurance' AND status IN ('completed', 'scheduled') THEN 1 END) as insurance_count,
        
        -- SessionResultData
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_sessions,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_sessions,
        COUNT(CASE WHEN status = 'no-show' THEN 1 END) as no_show_sessions,
        
        -- WeeklySessionsData
        COUNT(CASE WHEN year = ? AND month = ? AND week_number = 1 AND status IN ('completed', 'scheduled') THEN 1 END) as week1_count,
        COUNT(CASE WHEN year = ? AND month = ? AND week_number = 2 AND status IN ('completed', 'scheduled') THEN 1 END) as week2_count,
        COUNT(CASE WHEN year = ? AND month = ? AND week_number = 3 AND status IN ('completed', 'scheduled') THEN 1 END) as week3_count,
        COUNT(CASE WHEN year = ? AND month = ? AND week_number = 4 AND status IN ('completed', 'scheduled') THEN 1 END) as week4_count,
        COUNT(CASE WHEN year = ? AND month = ? AND week_number = 5 AND status IN ('completed', 'scheduled') THEN 1 END) as week5_count,
        
        -- Total sessions para porcentajes
        COUNT(CASE WHEN status IN ('completed', 'scheduled') THEN 1 END) as total_valid_sessions
        
      FROM session_stats
    `;
    
    const [masterSessionsResult] = await db.execute(masterSessionsQuery, [
      currentYear, currentMonth, currentYear, currentMonth, // current month
      previousYear, previousMonth, previousYear, previousMonth, // previous month
      today, // today
      currentYear, currentMonth, currentYear, currentMonth, // week 1-2
      currentYear, currentMonth, currentYear, currentMonth, // week 3-4  
      currentYear, currentMonth // week 5
    ]);

    // ===== QUERY 2: MASTER PATIENTS QUERY (Unifica 2 consultas) =====
    const masterPatientsQuery = `
      SELECT 
        -- RapidKPI: Pacientes activos y nuevos
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_patients,
        COUNT(CASE WHEN YEAR(created_at) = ? AND MONTH(created_at) = ? THEN 1 END) as new_patients_this_month,
        
        -- AgeDistributionData
        COUNT(CASE WHEN status = 'active' AND birth_date IS NOT NULL AND TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 18 AND 25 THEN 1 END) as age_18_25,
        COUNT(CASE WHEN status = 'active' AND birth_date IS NOT NULL AND TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 26 AND 35 THEN 1 END) as age_26_35,
        COUNT(CASE WHEN status = 'active' AND birth_date IS NOT NULL AND TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 36 AND 45 THEN 1 END) as age_36_45,
        COUNT(CASE WHEN status = 'active' AND birth_date IS NOT NULL AND TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) > 45 THEN 1 END) as age_over_45
      FROM patients
      WHERE is_active = true
    `;
    
    const [masterPatientsResult] = await db.execute(masterPatientsQuery, [currentYear, currentMonth]);

    // ===== QUERY 3: TODAY/TOMORROW SESSIONS + NEXT APPOINTMENT =====
    const todayTomorrowQuery = `
      SELECT 
        s.session_date,
        s.start_time,
        p.name as patient_name,
        s.mode as session_type,
        c.name as clinic_name,
        CASE 
          WHEN s.session_date = ? AND s.start_time > ? THEN 'today_upcoming'
          WHEN s.session_date = ? THEN 'tomorrow'
          WHEN s.session_date = ? AND s.start_time > ? AND s.start_time = (
            SELECT MIN(start_time) 
            FROM sessions 
            WHERE session_date = ? AND status = 'scheduled' AND start_time > ?
          ) THEN 'next_appointment'
        END as session_category
      FROM sessions s
      INNER JOIN patients p ON s.patient_id = p.id AND p.is_active = true
      INNER JOIN clinics c ON s.clinic_id = c.id AND c.is_active = true
      WHERE ((s.session_date = ? AND s.status = 'scheduled' AND s.start_time > ?) 
             OR (s.session_date = ? AND s.status = 'scheduled'))
      ORDER BY s.session_date, s.start_time ASC
    `;
    
    const [todayTomorrowResult] = await db.execute(todayTomorrowQuery, [
      today, currentTime, // today upcoming
      tomorrowDate, // tomorrow
      today, currentTime, today, currentTime, // next appointment
      today, currentTime, tomorrowDate // WHERE clause
    ]);

    // ===== QUERY 4: MONTHLY REVENUE + CLINIC PERFORMANCE =====
    const revenueClinicQuery = `
      SELECT 
        'monthly' as data_type,
        YEAR(s.session_date) as year,
        MONTH(s.session_date) as month,
        NULL as clinic_name,
        COALESCE(SUM(s.price), 0) as revenue,
        COUNT(s.id) as session_count,
        NULL as avg_price
      FROM sessions s
      WHERE s.session_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        AND s.status IN ('completed', 'scheduled')
      GROUP BY YEAR(s.session_date), MONTH(s.session_date)
      
      UNION ALL
      
      SELECT 
        'clinic' as data_type,
        NULL as year,
        NULL as month,
        c.name as clinic_name,
        COALESCE(SUM(s.price), 0) as revenue,
        COUNT(s.id) as session_count,
        COALESCE(AVG(s.price), 0) as avg_price
      FROM clinics c
      LEFT JOIN sessions s ON c.id = s.clinic_id 
        AND s.status IN ('completed', 'scheduled')
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY data_type, revenue DESC
    `;
    
    const [revenueClinicResult] = await db.execute(revenueClinicQuery);

    // ===== QUERY 5: SESSIONS BY CLINIC DETAILS =====
    const sessionsByClinicQuery = `
      SELECT 
        c.id as clinic_id,
        c.name as clinic_name,
        COUNT(s.id) as total_sessions,
        GROUP_CONCAT(
          CASE WHEN s.id IS NOT NULL THEN 
            CONCAT(s.id, ':', DATE_FORMAT(s.session_date, '%Y-%m-%d'))
          END
          SEPARATOR '|'
        ) as sessions_details
      FROM clinics c
      LEFT JOIN sessions s ON c.id = s.clinic_id 
        AND s.status IN ('completed', 'scheduled')
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY total_sessions DESC
    `;
    
    const [sessionsByClinicResult] = await db.execute(sessionsByClinicQuery);

    // ===== PROCESAMIENTO Y MAPEO DE DATOS =====
    
    const sessionStats = masterSessionsResult[0];
    const patientStats = masterPatientsResult[0];

    // 1. RapidKPIData
    const sesionesVariacion = sessionStats.previous_month_sessions > 0 
      ? ((sessionStats.current_month_sessions - sessionStats.previous_month_sessions) / sessionStats.previous_month_sessions) * 100 
      : (sessionStats.current_month_sessions > 0 ? 100 : 0);

    const ingresosVariacion = sessionStats.previous_month_revenue > 0 
      ? ((sessionStats.current_month_revenue - sessionStats.previous_month_revenue) / sessionStats.previous_month_revenue) * 100 
      : (sessionStats.current_month_revenue > 0 ? 100 : 0);

    // Buscar siguiente cita
    const nextAppointment = todayTomorrowResult.find(session => session.session_category === 'next_appointment');

    const rapidKPIData = {
      sesiones_mes: sessionStats.current_month_sessions,
      sesiones_variacion: Math.round(sesionesVariacion * 100) / 100,
      ingresos_mes: parseFloat(sessionStats.current_month_revenue),
      ingresos_variacion: Math.round(ingresosVariacion * 100) / 100,
      pacientes_activos: patientStats.active_patients,
      pacientes_nuevos_mes: patientStats.new_patients_this_month,
      proximas_citas_hoy: sessionStats.today_scheduled_sessions,
      siguiente_cita_hora: nextAppointment ? nextAppointment.start_time : null
    };

    // 2. AgeDistributionData
    const ageDistributionData = [
      { age_range: '18-25', patient_count: patientStats.age_18_25 },
      { age_range: '26-35', patient_count: patientStats.age_26_35 },
      { age_range: '36-45', patient_count: patientStats.age_36_45 },
      { age_range: '>45', patient_count: patientStats.age_over_45 }
    ].filter(item => item.patient_count > 0);

    // 3. DistributionByModalityData
    const distributionByModalityData = [
      { modality_type: 'Presencial', session_count: sessionStats.presencial_count },
      { modality_type: 'Online', session_count: sessionStats.online_count }
    ].filter(item => item.session_count > 0);

    // 4. PaymentMethodsData
    const totalSessions = sessionStats.total_valid_sessions;
    const paymentMethodsData = [
      { payment_method: 'cash', percentage: Math.round((sessionStats.cash_count / totalSessions) * 10000) / 100 },
      { payment_method: 'card', percentage: Math.round((sessionStats.card_count / totalSessions) * 10000) / 100 },
      { payment_method: 'transfer', percentage: Math.round((sessionStats.transfer_count / totalSessions) * 10000) / 100 },
      { payment_method: 'insurance', percentage: Math.round((sessionStats.insurance_count / totalSessions) * 10000) / 100 }
    ].filter(item => item.percentage > 0);

    // 5. SessionResultData
    const sessionResultData = [
      { session_status: 'completed', session_count: sessionStats.completed_sessions },
      { session_status: 'scheduled', session_count: sessionStats.scheduled_sessions },
      { session_status: 'cancelled', session_count: sessionStats.cancelled_sessions },
      { session_status: 'no-show', session_count: sessionStats.no_show_sessions }
    ].filter(item => item.session_count > 0);

    // 6. WeeklySessionsData
    const weeklySessionsData = [
      { week_number: 1, week_label: 'Semana 1', session_count: sessionStats.week1_count },
      { week_number: 2, week_label: 'Semana 2', session_count: sessionStats.week2_count },
      { week_number: 3, week_label: 'Semana 3', session_count: sessionStats.week3_count },
      { week_number: 4, week_label: 'Semana 4', session_count: sessionStats.week4_count },
      { week_number: 5, week_label: 'Semana 5', session_count: sessionStats.week5_count }
    ].filter(item => item.session_count > 0);

    // 7. MonthlyRevenueData
    const monthlyRevenueData = revenueClinicResult
      .filter(row => row.data_type === 'monthly')
      .map(month => ({
        year: month.year,
        month: month.month,
        month_name: new Date(month.year, month.month - 1, 1).toLocaleString('es-ES', { month: 'long' }),
        revenue: parseFloat(month.revenue)
      }));

    // 8. ClinicPerformanceData
    const clinicPerformanceData = revenueClinicResult
      .filter(row => row.data_type === 'clinic')
      .map(clinic => ({
        clinic_name: clinic.clinic_name,
        session_count: clinic.session_count,
        average_session_price: Math.round(parseFloat(clinic.avg_price) * 100) / 100,
        total_revenue: parseFloat(clinic.revenue)
      }));

    // 9. TodayUpcomingSessionsData
    const todayUpcomingSessionsData = todayTomorrowResult
      .filter(session => session.session_category === 'today_upcoming')
      .map(session => ({
        start_time: session.start_time,
        patient_name: session.patient_name,
        session_type: session.session_type,
        clinic_name: session.clinic_name
      }));

    // 10. TomorrowSessionsData
    const tomorrowSessionsData = todayTomorrowResult
      .filter(session => session.session_category === 'tomorrow')
      .map(session => ({
        start_time: session.start_time,
        patient_name: session.patient_name,
        session_type: session.session_type,
        clinic_name: session.clinic_name
      }));

    // 11. SessionsByClinicData
    const sessionsByClinicData = sessionsByClinicResult.map(clinic => {
      const sessions = [];
      if (clinic.sessions_details) {
        const sessionsList = clinic.sessions_details.split('|');
        sessionsList.forEach(sessionStr => {
          if (sessionStr && sessionStr.includes(':')) {
            const [sessionId, sessionDate] = sessionStr.split(':');
            sessions.push({
              session_id: parseInt(sessionId),
              session_date: sessionDate
            });
          }
        });
      }

      return {
        clinic_id: clinic.clinic_id,
        clinic_name: clinic.clinic_name,
        total_sessions: clinic.total_sessions,
        sessions: sessions
      };
    });

    // ===== RESPUESTA FINAL =====
    return {
      RapidKPIData: rapidKPIData,
      AgeDistributionData: ageDistributionData,
      ClinicPerformanceData: clinicPerformanceData,
      DistributionByModalityData: distributionByModalityData,
      MonthlyRevenueData: monthlyRevenueData,
      PaymentMethodsData: paymentMethodsData,
      SessionResultData: sessionResultData,
      SessionsByClinicData: sessionsByClinicData,
      TodayUpcomingSessionsData: todayUpcomingSessionsData,
      TomorrowSessionsData: tomorrowSessionsData,
      WeeklySessionsData: weeklySessionsData
    };

  } catch (error) {
    console.error('Error al obtener KPIs del dashboard (optimizado):', error);
    throw error;
  }
};

module.exports = {
  getDashboardKPIs,
};