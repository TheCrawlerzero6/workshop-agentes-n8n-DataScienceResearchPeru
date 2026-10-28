const n0 = trigger({
  "type": "n8n-nodes-base.scheduleTrigger",
  "version": 1.4,
  "config": {
    "name": "Cada hora",
    "parameters": {
      "rule": {
        "interval": [
          {
            "field": "hours",
            "hoursInterval": 1,
            "triggerAtMinute": 0
          }
        ]
      }
    }
  },
  "output": [
    {}
  ]
});
const n1 = node({
  "type": "n8n-nodes-base.code",
  "version": 2,
  "config": {
    "name": "Verificar tablas del taller",
    "parameters": {
      "mode": "runOnceForAllItems",
      "jsCode": "function requireReady(c) {\n  if (c.ready !== true ||\n      !c.botKey || !c.calendarId || c.calendarId.startsWith('REPLACE_') ||\n      !c.historyTableId || c.historyTableId.startsWith('REPLACE_') ||\n      !c.operationsTableId || c.operationsTableId.startsWith('REPLACE_')) {\n    throw new Error('Configuración pendiente: completa el preflight y la revisión antes de ejecutar.');\n  }\n  new Intl.DateTimeFormat('es', { timeZone: c.timezone }).format();\n  return c;\n}\nrequireReady({\"ready\":false,\"botName\":\"Asistente de citas\",\"tone\":\"amable y breve\",\"botKey\":\"taller-citas-01\",\"timezone\":\"America/Guayaquil\",\"defaultDurationMinutes\":60,\"calendarId\":\"REPLACE_FIXED_CALENDAR_ID\",\"modelId\":\"SELECT_MODEL_IN_N8N\",\"historyTableId\":\"REPLACE_HISTORY_TABLE_ID\",\"operationsTableId\":\"REPLACE_OPERATIONS_TABLE_ID\",\"mainWorkflowId\":\"REPLACE_MAIN_WORKFLOW_ID\",\"bookingWorkflowId\":\"REPLACE_BOOKING_WORKFLOW_ID\",\"credentials\":{\"telegram\":{\"id\":\"\",\"name\":\"\"},\"calendar\":{\"id\":\"\",\"name\":\"\"},\"model\":{\"id\":\"\",\"name\":\"\"}}});return [{json:{ok:true}}];"
    }
  },
  "output": [
    {
      "status": "valid"
    }
  ]
});
const n2 = node({
  "type": "n8n-nodes-base.dataTable",
  "version": 1.1,
  "config": {
    "name": "Borrar historial vencido",
    "parameters": {
      "resource": "row",
      "operation": "deleteRows",
      "dataTableId": {
        "__rl": true,
        "mode": "list",
        "value": "REPLACE_HISTORY_TABLE_ID",
        "cachedResultName": "Taller citas · historial"
      },
      "matchType": "allConditions",
      "filters": {
        "conditions": [
          {
            "keyName": "expiresAt",
            "condition": "lte",
            "keyValue": expr("{{ $now.toISO() }}")
          }
        ]
      },
      "options": {
        "dryRun": false
      }
    }
  },
  "output": [
    {}
  ]
});
const n3 = node({
  "type": "n8n-nodes-base.dataTable",
  "version": 1.1,
  "config": {
    "name": "Borrar operaciones vencidas",
    "parameters": {
      "resource": "row",
      "operation": "deleteRows",
      "dataTableId": {
        "__rl": true,
        "mode": "list",
        "value": "REPLACE_OPERATIONS_TABLE_ID",
        "cachedResultName": "Taller citas · operaciones"
      },
      "matchType": "allConditions",
      "filters": {
        "conditions": [
          {
            "keyName": "expiresAt",
            "condition": "lte",
            "keyValue": expr("{{ $now.toISO() }}")
          }
        ]
      },
      "options": {
        "dryRun": false
      }
    }
  },
  "output": [
    {}
  ]
});
export default workflow('workshop-backup', "Taller citas · retención")
  .add(n0.output(0).to(n1.input(0)))
  .add(n1.output(0).to(n2.input(0)))
  .add(n1.output(0).to(n3.input(0)));
