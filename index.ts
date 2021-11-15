import {
  Resource,
  envDetector,
  processDetector,
} from "@opentelemetry/resources";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";
import {
  ExpressInstrumentation,
  ExpressLayerType,
} from "@opentelemetry/instrumentation-express";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const otelSDK = new NodeSDK({
  contextManager: new AsyncLocalStorageContextManager(),
  autoDetectResources: false,
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingPaths: ["/favicon.ico", "/socket.io"],
    }),
    new ExpressInstrumentation({
      ignoreLayers: [/^\/_internal\//],
      ignoreLayersType: [
        ExpressLayerType.MIDDLEWARE,
        ExpressLayerType.REQUEST_HANDLER,
      ],
    }),
    new NestInstrumentation(),
  ],
});

otelSDK.configureMeterProvider({
  exporter: new OTLPMetricExporter({
    url: "",
  }),
});

otelSDK.detectResources({ detectors: [envDetector, processDetector] });

const tracer = new NodeTracerProvider({});

tracer.addSpanProcessor(
  new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: "",
    })
  )
);
