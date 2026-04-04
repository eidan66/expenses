"use client"

import * as React from "react"
import { AlertTriangle, Info, TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const defaultData = [
  { category: "Needs", amount: 10000, fill: "var(--color-chart-2)" },
  { category: "Wants", amount: 6000, fill: "var(--color-chart-3)" },
  { category: "Savings", amount: 4000, fill: "var(--color-chart-1)" },
]

const chartConfig = {
  amount: {
    label: "סכום",
  },
  Needs: {
    label: "צרכים",
    color: "hsl(var(--chart-2))",
  },
  Wants: {
    label: "רצונות",
    color: "hsl(var(--chart-3))",
  },
  Savings: {
    label: "חיסכון",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export type BudgetChartFooterVariant = "positive" | "neutral" | "caution"

export type BudgetPieChartProps = {
  dataOverride?: { category: string; amount: number; fill: string }[]
  chartSubtitle?: string
  footer?: { variant: BudgetChartFooterVariant; message: string }
}

export function BudgetPieChart({ dataOverride, chartSubtitle, footer }: BudgetPieChartProps) {
  const rawData = dataOverride ?? defaultData
  const chartData = rawData.filter((d) => d.amount > 0)
  const totalAmount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [chartData])

  const resolvedFooter = footer ?? {
    variant: "neutral" as const,
    message: "התאימו את התקציב המתוכנן לפי הצרכים שלכם",
  }

  const FooterIcon =
    resolvedFooter.variant === "positive"
      ? TrendingUp
      : resolvedFooter.variant === "caution"
        ? AlertTriangle
        : Info

  return (
    <Card className="flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-heading">חלוקת תקציב מתוכננת</CardTitle>
        <CardDescription>{chartSubtitle ?? "לפי יעדי הקטגוריות שהגדרתם"}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length === 0 ? (
          <div className="mx-auto flex aspect-square max-h-[250px] max-w-[250px] flex-col items-center justify-center rounded-full border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
            עדיין אין סכומי תקציב מתוכננים — הוסיפו קטגוריות או עדכנו יעדים חודשיים
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold font-heading"
                          >
                            ₪{totalAmount.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            סה"כ מתוכנן
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm text-center px-2">
        <div
          className={cn(
            "flex items-center justify-center gap-2 font-medium leading-snug",
            resolvedFooter.variant === "positive" && "text-primary",
            resolvedFooter.variant === "caution" && "text-amber-700 dark:text-amber-500",
            resolvedFooter.variant === "neutral" && "text-muted-foreground"
          )}
        >
          <FooterIcon className="h-4 w-4 shrink-0" />
          <span>{resolvedFooter.message}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
