export interface ClinicConfig {
  id: number;
  name: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
}

export const CLINIC_CONFIGS: ClinicConfig[] = [
  {
    id: 1,
    name: "Clínica Norte",
    color: "text-white",
    backgroundColor: "bg-[#d29f67]",
    borderColor: "border-[#d29f67]"
  },
  {
    id: 2,
    name: "Clínica Sur",
    color: "text-white",
    backgroundColor: "bg-green-500",
    borderColor: "border-green-500"
  },
  {
    id: 3,
    name: "Clínica Centro",
    color: "text-white",
    backgroundColor: "bg-purple-500",
    borderColor: "border-purple-500"
  },
  {
    id: 4,
    name: "Clínica Este",
    color: "text-white",
    backgroundColor: "bg-orange-500",
    borderColor: "border-orange-500"
  },
  {
    id: 5,
    name: "Clínica Oeste",
    color: "text-white",
    backgroundColor: "bg-pink-500",
    borderColor: "border-pink-500"
  },
   {
    id: 6,
    name: "Privado",
    color: "text-white",
    backgroundColor: "bg-yellow-500",
    borderColor: "border-yellow-500"
  }
];
