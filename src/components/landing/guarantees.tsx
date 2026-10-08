import { EyeOff, Landmark, Users } from "lucide-react";

const GUARANTEES = [
  {
    icon: Landmark,
    title: "Des votes officiels",
    text: "Les positions des groupes viennent des données ouvertes de l'Assemblée nationale. Chaque résultat renvoie au scrutin.",
  },
  {
    icon: EyeOff,
    title: "Rien n'est enregistré",
    text: "Vos réponses restent dans votre navigateur. Elles ne quittent votre appareil que dans le lien de résultat, si vous le partagez.",
  },
  {
    icon: Users,
    title: "Une comparaison, pas une consigne",
    text: "Le résultat porte sur les votes des groupes, pas sur le programme des candidats. Ce n'est pas une recommandation de vote.",
  },
] as const;

export const Guarantees = () => {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-3xl font-extrabold tracking-tight">Ce qu&apos;il faut savoir</h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {GUARANTEES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex flex-col gap-2 rounded-card border-2 border-line bg-surface p-5">
            <Icon aria-hidden className="size-7 text-primary" />
            <h3 className="font-display text-lg font-bold">{title}</h3>
            <p className="leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};
