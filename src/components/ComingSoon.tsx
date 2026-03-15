import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: Props) {
  return (
    <div>
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#B0E0E6",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ fontSize: "15px", color: "#9aa5b0", margin: 0 }}>{description}</p>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 40px",
          backgroundColor: "#36393F",
          borderRadius: "12px",
          border: "1px dashed #4a5568",
          textAlign: "center",
        }}
      >
        <Construction size={36} color="#7a8a95" style={{ marginBottom: "16px" }} />
        <p style={{ fontSize: "18px", fontWeight: 600, color: "#9aa5b0", margin: "0 0 8px" }}>
          Coming Soon
        </p>
        <p style={{ fontSize: "14px", color: "#7a8a95", margin: 0 }}>
          This section is being built. Check back soon.
        </p>
      </div>
    </div>
  );
}
