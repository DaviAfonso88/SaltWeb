import { type LucideProps } from "lucide-react";

type StepProps = {
  icon: React.ReactElement<LucideProps>;
  title: string;
  description: string;
};

export default function Step({ icon, title, description }: StepProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary/20 rounded-full">{icon}</div>
      <p className="text-lg text-muted-foreground">
        <span className="font-semibold text-foreground">{title}</span>{" "}
        {description}
      </p>
    </div>
  );
}
