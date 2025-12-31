"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
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

export function BudgetPieChart({ dataOverride }: { dataOverride?: any[] }) {
  const chartData = dataOverride || defaultData;
  const totalAmount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-heading">חלוקת תקציב</CardTitle>
        <CardDescription>פירוט חודשי</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
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
                          סה"כ
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm text-center">
        <div className="flex items-center gap-2 font-medium leading-none">
          אתם בדרך הנכונה החודש <TrendingUp className="h-4 w-4 text-primary" />
        </div>
      </CardFooter>
    </Card>
  )
}
