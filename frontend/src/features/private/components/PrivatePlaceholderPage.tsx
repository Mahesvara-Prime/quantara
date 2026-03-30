import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";

export function PrivatePlaceholderPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-sm text-[#E6EDF3]/70">{subtitle}</p>
      ) : null}

      <Divider className="my-4" />

      <div className="text-sm text-[#E6EDF3]/70">
        Placeholder (interface privée) - contenu à implémenter.
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}

