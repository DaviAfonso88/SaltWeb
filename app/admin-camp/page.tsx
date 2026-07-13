"use client";

import { useEffect, useState } from "react";
import {
  Users,
  HeartPulse,
  Pill,
  AlertTriangle,
  UtensilsCrossed,
  Activity,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis } from "recharts";

interface Stats {
  total: number;
  totalResponsaveis: number;
  comRestricoesAlimentares: number;
  comMedicamentos: number;
  comAlergias: number;
  comNecessidadesEspeciais: number;
  porIgreja: Record<string, number>;
  porCidade: Record<string, number>;
  porCondicoes: Record<string, number>;
  porIdade: Record<string, number>;
  porSexo: Record<string, number>;
  nomesComAlergias: string[];
  nomesComMedicamentos: string[];
  nomesComRestricoesAlimentares: string[];
  nomesComCondicoes: string[];
}

const COLORS = [
  "oklch(0.65 0.18 75)",
  "oklch(0.6 0.15 55)",
  "oklch(0.55 0.2 40)",
  "oklch(0.7 0.14 85)",
  "oklch(0.5 0.18 30)",
  "oklch(0.75 0.12 95)",
  "oklch(0.45 0.16 20)",
  "oklch(0.8 0.1 105)",
  "oklch(0.4 0.2 15)",
  "oklch(0.85 0.08 115)",
];

const pieChartConfig = {
  value: {
    label: "Quantidade",
  },
} satisfies ChartConfig;

const barChartConfig = {
  value: {
    label: "Quantidade",
  },
} satisfies ChartConfig;

function StatsCardSkeleton() {
  return (
    <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-32 bg-amber-500/10" />
        <Skeleton className="size-10 rounded-xl bg-amber-500/10" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-9 w-16 bg-amber-500/10" />
        <Skeleton className="h-3 w-24 bg-amber-500/10" />
      </CardContent>
    </Card>
  );
}

function NameListSection({
  title,
  icon: Icon,
  names,
  color,
  borderColor,
  iconBg,
}: {
  title: string;
  icon: React.ElementType;
  names: string[];
  color: string;
  borderColor: string;
  iconBg: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_COUNT = 6;
  const hasMore = names.length > PREVIEW_COUNT;
  const visibleNames = expanded ? names : names.slice(0, PREVIEW_COUNT);

  if (names.length === 0) return null;

  return (
    <Card className={`${borderColor} bg-gradient-to-br from-card to-card/50`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <div className={`flex size-7 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`size-3.5 ${color}`} />
          </div>
          {title}
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {names.length} {names.length === 1 ? "pessoa" : "pessoas"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1.5">
          {visibleNames.map((nome, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${borderColor} bg-white/[0.02]`}
            >
              <User className="size-3 text-muted-foreground" />
              {nome}
            </span>
          ))}
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-3" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="size-3" />
                Ver todas ({names.length})
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/camp-admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral do acampamento
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl border-amber-500/10 bg-amber-500/5" />
          <Skeleton className="h-80 rounded-xl border-amber-500/10 bg-amber-500/5" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10">
          <Activity className="size-8 text-amber-400" />
        </div>
        <p className="text-muted-foreground">
          Erro ao carregar estatísticas
        </p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Participantes",
      value: stats.total,
      icon: Users,
      gradient: "from-blue-500/15 to-blue-600/5",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/15",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Total Responsáveis",
      value: stats.totalResponsaveis,
      icon: Users,
      gradient: "from-violet-500/15 to-violet-600/5",
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/15",
      borderColor: "border-violet-500/20",
    },
    {
      title: "Restrições Alimentares",
      value: stats.comRestricoesAlimentares,
      icon: UtensilsCrossed,
      gradient: "from-orange-500/15 to-orange-600/5",
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/15",
      borderColor: "border-orange-500/20",
    },
    {
      title: "Usam Medicamentos",
      value: stats.comMedicamentos,
      icon: Pill,
      gradient: "from-emerald-500/15 to-emerald-600/5",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Com Alergias",
      value: stats.comAlergias,
      icon: AlertTriangle,
      gradient: "from-amber-500/15 to-amber-600/5",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/15",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Necessidades Especiais",
      value: stats.comNecessidadesEspeciais,
      icon: HeartPulse,
      gradient: "from-rose-500/15 to-rose-600/5",
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/15",
      borderColor: "border-rose-500/20",
    },
  ];

  const sexoData = Object.entries(stats.porSexo).map(([name, value]) => ({
    name,
    value,
  }));

  const idadeData = Object.entries(stats.porIdade)
    .sort(([a], [b]) => {
      const order = ["0-11", "12-17", "18-29", "30-49", "50+"];
      return order.indexOf(a) - order.indexOf(b);
    })
    .map(([name, value]) => ({ name, value }));

  const hasHealthLists =
    stats.nomesComAlergias.length > 0 ||
    stats.nomesComMedicamentos.length > 0 ||
    stats.nomesComRestricoesAlimentares.length > 0 ||
    stats.nomesComCondicoes.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral do acampamento
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <Card key={card.title} className={`group relative overflow-hidden border ${card.borderColor} bg-gradient-to-br from-card to-card/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/10`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`flex size-10 items-center justify-center rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <card.icon className={`size-5 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold tracking-tight">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Name Lists */}
      {hasHealthLists && (
        <div>
          <h2 className="mb-4 font-[family-name:var(--font-poppins)] text-lg font-semibold tracking-tight">
            Pessoas com necessidades de saúde
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <NameListSection
              title="Com Alergias"
              icon={AlertTriangle}
              names={stats.nomesComAlergias}
              color="text-amber-400"
              borderColor="border-amber-500/20"
              iconBg="bg-amber-500/10"
            />
            <NameListSection
              title="Usam Medicamentos"
              icon={Pill}
              names={stats.nomesComMedicamentos}
              color="text-emerald-400"
              borderColor="border-emerald-500/20"
              iconBg="bg-emerald-500/10"
            />
            <NameListSection
              title="Restrições Alimentares"
              icon={UtensilsCrossed}
              names={stats.nomesComRestricoesAlimentares}
              color="text-orange-400"
              borderColor="border-orange-500/20"
              iconBg="bg-orange-500/10"
            />
            <NameListSection
              title="Condições de Saúde"
              icon={Activity}
              names={stats.nomesComCondicoes}
              color="text-emerald-400"
              borderColor="border-emerald-500/20"
              iconBg="bg-emerald-500/10"
            />
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sexo Chart with Counts */}
        {sexoData.length > 0 && (
          <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <div className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10">
                  <Users className="size-3.5 text-violet-400" />
                </div>
                Distribuição por Sexo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ChartContainer config={pieChartConfig} className="h-48 w-full max-w-[200px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={sexoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={35} strokeWidth={2} stroke="oklch(0.145 0 0)">
                      {sexoData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-col gap-3">
                  {sexoData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.value} {item.value === 1 ? "pessoa" : "pessoas"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {idadeData.length > 0 && (
          <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10">
                  <HeartPulse className="size-3.5 text-rose-400" />
                </div>
                Distribuição por Idade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig} className="h-64">
                <BarChart data={idadeData}>
                  <XAxis dataKey="name" tick={{ fill: "oklch(0.5 0 0)" }} />
                  <YAxis tick={{ fill: "oklch(0.5 0 0)" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="oklch(0.55 0.2 40)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
