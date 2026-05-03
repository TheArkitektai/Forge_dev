import { CitizenAuthPreview } from "@/forge/previews/CitizenAuthPreview";
import { PermitDashboardPreview } from "@/forge/previews/PermitDashboardPreview";
import type { OutputArtifact } from "@/forge/types";

type Props = {
  artifact: OutputArtifact;
};

export function DemoAppPreview({ artifact }: Props) {
  switch (artifact.previewComponent) {
    case "citizen_auth":
      return <CitizenAuthPreview />;
    case "permit_dashboard":
      return <PermitDashboardPreview />;
    default:
      return null;
  }
}
