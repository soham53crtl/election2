import traceAgent from "@google-cloud/trace-agent";

if (process.env.NODE_ENV === "production") {
  traceAgent.start({
    projectId: "speedy-aurora-471602-c2",
    enhancedDatabaseReporting: true
  });
}
