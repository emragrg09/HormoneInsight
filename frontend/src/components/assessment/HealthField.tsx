import { HelpCircle } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { FeatureField } from "@/types/api";

interface HealthFieldProps<T extends FieldValues> {
  field: FeatureField;
  control: Control<T>;
  error?: string;
}

export function HealthField<T extends FieldValues>({ field, control, error }: HealthFieldProps<T>) {
  const id = `field-${field.name}`;
  const describedBy =
    [field.description ? `${id}-desc` : null, error ? `${id}-err` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border/80 bg-surface/40 p-4 transition-colors focus-within:border-primary/30 focus-within:bg-surface/60 sm:p-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <Label htmlFor={id} className="text-sm font-medium leading-snug">
            {field.label}
            {field.required ? (
              <span className="ml-1 text-destructive" aria-label="required">
                *
              </span>
            ) : (
              <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
            )}
          </Label>
          {field.description && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`About ${field.label}`}
                    className="shrink-0 rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <HelpCircle className="size-3.5" aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {field.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground/80">
          {field.code && field.code !== field.label && (
            <span className="font-mono uppercase tracking-wide" aria-hidden>
              {field.code}
            </span>
          )}
          {field.code && field.code !== field.label && field.unit && <span aria-hidden>·</span>}
          {field.unit && <span>{field.unit}</span>}
        </div>
      </div>

      <Controller
        control={control}
        name={field.name as Path<T>}
        render={({ field: rhf }) => {
          const val = rhf.value;
          if (field.type === "select") {
            return (
              <Select value={val ? String(val) : ""} onValueChange={(v) => rhf.onChange(v || null)}>
                <SelectTrigger id={id} aria-describedby={describedBy}>
                  <SelectValue placeholder="Select an option…" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }
          if (field.type === "radio") {
            return (
              <RadioGroup
                value={val ? String(val) : ""}
                onValueChange={(v) => rhf.onChange(v || null)}
                aria-describedby={describedBy}
                className="flex flex-wrap gap-4 pt-1"
              >
                {field.options?.map((o) => {
                  const rid = `${id}-${o.value}`;
                  return (
                    <div key={o.value} className="flex items-center gap-2">
                      <RadioGroupItem id={rid} value={o.value} />
                      <Label htmlFor={rid} className="text-sm font-normal">
                        {o.label}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            );
          }
          return (
            <Input
              id={id}
              type={field.type === "number" ? "number" : "text"}
              inputMode={field.type === "number" ? "decimal" : undefined}
              min={field.min}
              max={field.max}
              step={field.step}
              placeholder={
                field.placeholder ??
                (field.type === "number" ? "Enter a value…" : "Type your answer…")
              }
              value={val == null ? "" : String(val)}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  rhf.onChange(null);
                  return;
                }
                rhf.onChange(field.type === "number" ? Number(v) : v);
              }}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              className="bg-background"
            />
          );
        }}
      />
      {field.description && (
        <p id={`${id}-desc`} className="text-xs leading-relaxed text-muted-foreground">
          {field.description}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
