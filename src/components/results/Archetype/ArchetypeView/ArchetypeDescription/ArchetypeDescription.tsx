interface ArchetypeDescriptionProps {
  text: string;
}

export const ArchetypeDescription = ({ text }: ArchetypeDescriptionProps) => (
  <p
    data-testid="archetype-description"
    className="text-base leading-[19px] wrap-anywhere whitespace-pre-line text-gi-primary"
  >
    {text}
  </p>
);
