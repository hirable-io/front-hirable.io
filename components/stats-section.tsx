export function StatsSection() {
  const stats = [
    {
      value: "98%",
      label: "Taxa de satisfação",
      description: "dos usuários",
    },
    {
      value: "15 dias",
      label: "Tempo médio",
      description: "para contratação",
    },
    {
      value: "50k+",
      label: "Vagas ativas",
      description: "mensalmente",
    },
    {
      value: "85%",
      label: "Match rate",
      description: "candidato-vaga",
    },
  ]

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mx-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-accent-foreground mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
