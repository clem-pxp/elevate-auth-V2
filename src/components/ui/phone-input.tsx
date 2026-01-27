"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const PhoneInputField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(function PhoneInputField({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "PhoneInputInput flex-1 h-10 px-4 text-base md:text-s text-strong bg-light border border-border-base border-l-0 rounded-r-14 outline-none transition-colors duration-150 placeholder:text-placeholder hover:border-border-strong focus:border-accent-base focus:ring-2 focus:ring-accent-base/20 disabled:bg-fade-lighter disabled:text-disabled disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

const PhoneInputContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  countryList: CountryEntry[];
  selectedCountry: RPNInput.Country;
  onCountryChange: (country: RPNInput.Country) => void;
  containerWidth: number;
} | null>(null);

export function PhoneInput({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder = "06 12 34 56 78",
  disabled,
}: PhoneInputProps) {
  const id = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hasError = Boolean(error);
  const [isOpen, setIsOpen] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [countryList, setCountryList] = React.useState<CountryEntry[]>([]);
  const [selectedCountry, setSelectedCountry] =
    React.useState<RPNInput.Country>("FR");
  const [onCountryChange, setOnCountryChange] = React.useState<
    (country: RPNInput.Country) => void
  >(() => () => {});

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth, { passive: true });
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      countryList,
      selectedCountry,
      onCountryChange,
      containerWidth,
    }),
    [isOpen, countryList, selectedCountry, onCountryChange, containerWidth],
  );

  const handleCountrySelectMount = React.useCallback(
    (
      countries: CountryEntry[],
      country: RPNInput.Country,
      onChange: (c: RPNInput.Country) => void,
    ) => {
      setCountryList(countries);
      setSelectedCountry(country);
      setOnCountryChange(() => onChange);
    },
    [],
  );

  return (
    <PhoneInputContext.Provider value={contextValue}>
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-s font-medium leading-tight text-fade"
          >
            {label}
          </label>
        )}
        <Popover open={isOpen} modal onOpenChange={setIsOpen}>
          <div ref={containerRef}>
            <RPNInput.default
              international
              defaultCountry="FR"
              value={value || undefined}
              onChange={(val) => onChange(val || "")}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={placeholder}
              className={cn(
                "flex",
                hasError &&
                  "[&_.PhoneInputInput]:border-error-base [&_.PhoneInputInput]:focus:border-error-base [&_.PhoneInputInput]:focus:ring-error-base/20",
              )}
              flagComponent={FlagComponent}
              countrySelectComponent={(props) => (
                <CountrySelect {...props} onMount={handleCountrySelectMount} />
              )}
              inputComponent={PhoneInputField}
              smartCaret={false}
            />
          </div>
          <CountrySelectPopover />
        </Popover>
        {error && <p className="text-s text-error-base">{error}</p>}
      </div>
    </PhoneInputContext.Provider>
  );
}

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
  onMount: (
    countries: CountryEntry[],
    country: RPNInput.Country,
    onChange: (c: RPNInput.Country) => void,
  ) => void;
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
  onMount,
}: CountrySelectProps) => {
  const context = React.useContext(PhoneInputContext);

  React.useEffect(() => {
    onMount(countryList, selectedCountry, onChange);
  }, [countryList, selectedCountry, onChange, onMount]);

  return (
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className="flex gap-1 rounded-l-14 rounded-r-none border-r-0 px-3 focus:z-10 h-10 shadow-none"
        disabled={disabled}
        onClick={() => context?.setIsOpen(true)}
      >
        <FlagComponent
          country={selectedCountry}
          countryName={selectedCountry}
        />
        <ChevronsUpDown
          className={cn(
            "-mr-2 size-4 opacity-50",
            disabled ? "hidden" : "opacity-100",
          )}
        />
      </Button>
    </PopoverTrigger>
  );
};

const CountrySelectPopover = () => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const context = React.useContext(PhoneInputContext);

  if (!context || context.countryList.length === 0) return null;

  const {
    countryList,
    selectedCountry,
    onCountryChange,
    setIsOpen,
    containerWidth,
  } = context;

  return (
    <PopoverContent
      className="p-0"
      style={{ width: containerWidth > 0 ? containerWidth : undefined }}
      align="start"
      onOpenAutoFocus={() => setSearchValue("")}
    >
      <Command>
        <CommandInput
          value={searchValue}
          onValueChange={(val) => {
            setSearchValue(val);
            setTimeout(() => {
              if (scrollAreaRef.current) {
                const viewportElement = scrollAreaRef.current.querySelector(
                  "[data-radix-scroll-area-viewport]",
                );
                if (viewportElement) {
                  viewportElement.scrollTop = 0;
                }
              }
            }, 0);
          }}
          placeholder="Rechercher un pays..."
        />
        <CommandList>
          <ScrollArea ref={scrollAreaRef} className="h-72">
            <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
            <CommandGroup>
              {countryList.map(({ value, label }) =>
                value ? (
                  <CountrySelectOption
                    key={value}
                    country={value}
                    countryName={label}
                    selectedCountry={selectedCountry}
                    onChange={onCountryChange}
                    onSelectComplete={() => setIsOpen(false)}
                  />
                ) : null,
              )}
            </CommandGroup>
          </ScrollArea>
        </CommandList>
      </Command>
    </PopoverContent>
  );
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
  onSelectComplete: () => void;
}

const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}: CountrySelectOptionProps) => {
  const handleSelect = () => {
    onChange(country);
    onSelectComplete();
  };

  return (
    <CommandItem className="gap-2" onSelect={handleSelect}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-soft">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon
        className={cn(
          "ml-auto size-4",
          country === selectedCountry ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-5 overflow-hidden rounded-sm bg-fade-lighter [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
