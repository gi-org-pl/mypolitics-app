import type React from "react";

interface PersonalityDescriptionProps {
  text: string;
  className?: string;
}

export const PersonalityDescription: React.FC<PersonalityDescriptionProps> = ({
  text,
  className = "",
}) => (
  <div
    className={`text-sm sm:text-base font-bold text-gi-primary ${className}`}
  >
    <div className="leading-relaxed">{text}</div>
  </div>
);
