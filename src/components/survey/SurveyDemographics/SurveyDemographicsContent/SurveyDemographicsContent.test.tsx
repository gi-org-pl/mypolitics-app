import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DemographicsInput } from "../SurveyDemographics.types";
import SurveyDemographicsContent from "./SurveyDemographicsContent";

// Domyślny stan makiety (mock), który przekazujemy do kontrolowanego komponentu
const defaultMockValue: DemographicsInput = {
  age: null,
  gender: null,
  residenceAreaSize: null,
  education: null,
  region: "",
};

describe("<SurveyDemographicsContent />", () => {
  describe("given rendered", () => {
    it("renders a Select for each demographic field", () => {
      const handleChange = vi.fn();
      render(
        <SurveyDemographicsContent 
          value={defaultMockValue} 
          handleChange={handleChange} 
        />
      );

      // Elementy select z mapy danych (wiek, płeć, wielkość zamieszkania, wykształcenie, województwo)
      const triggers = screen.getAllByRole("combobox");
      expect(triggers).toHaveLength(5);
    });

    it("renders age, gender, residenceAreaSize, education, and region selects", () => {
      const handleChange = vi.fn();
      render(
        <SurveyDemographicsContent 
          value={defaultMockValue} 
          handleChange={handleChange} 
        />
      );

      expect(screen.getByLabelText("Wiek")).toBeInTheDocument();
      expect(screen.getByLabelText("Płeć")).toBeInTheDocument();
      expect(screen.getByLabelText("Wielkość miejsca zamieszkania")).toBeInTheDocument();
      expect(screen.getByLabelText("Wykształcenie")).toBeInTheDocument();
      expect(screen.getByLabelText("Województwo")).toBeInTheDocument();
    });
  });

  describe("when a select value changes", () => {
    it("calls handleChange with the correct control key and value", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <SurveyDemographicsContent 
          value={defaultMockValue} 
          handleChange={handleChange} 
        />
      );

      // Pobieramy element select powiązany z etykietą "Płeć"
      const genderSelect = screen.getByLabelText("Płeć");
      
      // Dla standardowych/athenowych Selectów najbezpieczniejszą metodą interakcji jest selectOptions
      // Zakładając, że wartość "male" odpowiada kluczowi lub wartości opcji w stałych
      await user.selectOptions(genderSelect, "male");

      expect(handleChange).toHaveBeenCalledWith("gender", "male");
    });
  });
});