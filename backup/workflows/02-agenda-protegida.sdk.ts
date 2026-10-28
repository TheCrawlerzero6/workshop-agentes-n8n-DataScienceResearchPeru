const n0 = trigger({
  "type": "n8n-nodes-base.executeWorkflowTrigger",
  "version": 1.3,
  "config": {
    "name": "Recibir solicitud",
    "parameters": {
      "inputSource": "workflowInputs",
      "workflowInputs": {
        "values": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "start",
            "type": "string"
          },
          {
            "name": "end",
            "type": "string"
          },
          {
            "name": "sessionKey",
            "type": "string"
          },
          {
            "name": "turnKey",
            "type": "string"
          },
          {
            "name": "requester",
            "type": "string"
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
    "name": "Validar propuesta",
    "parameters": {
      "mode": "runOnceForAllItems",
      "jsCode": "function requireReady(c) {\n  if (c.ready !== true ||\n      !c.botKey || !c.calendarId || c.calendarId.startsWith('REPLACE_') ||\n      !c.historyTableId || c.historyTableId.startsWith('REPLACE_') ||\n      !c.operationsTableId || c.operationsTableId.startsWith('REPLACE_')) {\n    throw new Error('Configuración pendiente: completa el preflight y la revisión antes de ejecutar.');\n  }\n  new Intl.DateTimeFormat('es', { timeZone: c.timezone }).format();\n  return c;\n}\nfunction stableEventId(turnKey) {\n  // Non-cryptographic deterministic identifier; hex is a subset of Calendar base32hex.\n  let a=0x811c9dc5,b=0x9e3779b9,c=0x85ebca6b,d=0xc2b2ae35;\n  for (const ch of turnKey) {\n    const n=ch.codePointAt(0); a=Math.imul(a^n,16777619); b=Math.imul(b^n,2246822519);\n    c=Math.imul(c^n,3266489917); d=Math.imul(d^n,668265263);\n  }\n  return 'c'+[a,b,c,d].map(n=>(n>>>0).toString(16).padStart(8,'0')).join('');\n}\nfunction validateProposal(input, c, now = Date.now()) {\n  requireReady(c);\n  // The session comes from the verified sender, never from the model: it fixes who approves.\n  const prefix=`${c.botKey}:`, sessionKey=input.sessionKey, chatId=String(sessionKey??'').slice(prefix.length);\n  if (typeof sessionKey !== 'string' || !sessionKey.startsWith(prefix) || !/^\\d+$/.test(chatId) ||\n      typeof input.turnKey !== 'string' || !input.turnKey.startsWith(`${sessionKey}:`) ||\n      !/^\\d+$/.test(input.turnKey.slice(sessionKey.length+1))) {\n    throw new Error('Contexto de sesión no autorizado.');\n  }\n  if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 200) {\n    throw new Error('Falta un título válido de hasta 200 caracteres.');\n  }\n  const iso=/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,3})?(?:Z|[+-](?:0\\d|1[0-4]):[0-5]\\d)$/;\n  if (typeof input.start!=='string'||typeof input.end!=='string'||!iso.test(input.start)||!iso.test(input.end)) {\n    throw new Error('Las fechas deben incluir día, hora y zona horaria explícitos.');\n  }\n  const start=Date.parse(input.start), end=Date.parse(input.end);\n  // Reject calendar rollover (e.g. February 30) using the offset's local date.\n  for (const value of [input.start,input.end]) {\n    const datePart=value.slice(0,10), local=value.slice(0,-(value.endsWith('Z')?1:6))+'Z';\n    const t=Date.parse(local);\n    if (!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==datePart) throw new Error('Fecha inexistente.');\n  }\n  if (!Number.isFinite(start)||!Number.isFinite(end)||start<=now||end<=start) {\n    throw new Error('El inicio debe ser futuro y el fin posterior al inicio.');\n  }\n  const title=input.title.trim().replace(/[\\r\\n\\t]/g,' ');\n  const requester=typeof input.requester==='string'?input.requester.replace(/[\\u0000-\\u001f\\u007f]/g,' ').trim().slice(0,40):'';\n  // Several people share the calendar: the event name says who asked for it.\n  const summary=/[\\p{L}\\p{N}]/u.test(requester)?`${title} (${requester})`:title;\n  const eventId=stableEventId(input.turnKey);\n  const fmt=new Intl.DateTimeFormat('es-EC',{timeZone:c.timezone,dateStyle:'full',timeStyle:'short'});\n  // Send-and-wait uses legacy Markdown. Escape delimiters; preserve the exact title.\n  const display=title.replace(/[\\\\_*`\\[]/g,ch=>'\\\\'+ch);\n  return { title, start:new Date(start).toISOString(), end:new Date(end).toISOString(),\n    summary, chatId, sessionKey, turnKey:input.turnKey, operationKey:`proposal:${input.turnKey}`, eventId,\n    expiresAt:new Date(now+7*86400000).toISOString(),\n    approvalExpiresAt:new Date(now+10*60000).toISOString(),\n    approvalMessage:`¿Creo esta cita?\\n${display}\\nInicio: ${fmt.format(start)}\\nFin: ${fmt.format(end)}\\nZona: ${c.timezone}\\nDuración: ${(end-start)/60000} minutos\\nNo se enviarán invitaciones.` };\n}\ntry{return [{json:{proposal:validateProposal($input.first().json,{\"ready\":false,\"botName\":\"Asistente de citas\",\"tone\":\"amable y breve\",\"botKey\":\"taller-citas-01\",\"timezone\":\"America/Guayaquil\",\"defaultDurationMinutes\":60,\"calendarId\":\"REPLACE_FIXED_CALENDAR_ID\",\"modelId\":\"SELECT_MODEL_IN_N8N\",\"historyTableId\":\"REPLACE_HISTORY_TABLE_ID\",\"operationsTableId\":\"REPLACE_OPERATIONS_TABLE_ID\",\"mainWorkflowId\":\"REPLACE_MAIN_WORKFLOW_ID\",\"bookingWorkflowId\":\"REPLACE_BOOKING_WORKFLOW_ID\",\"credentials\":{\"telegram\":{\"id\":\"\",\"name\":\"\"},\"calendar\":{\"id\":\"\",\"name\":\"\"},\"model\":{\"id\":\"\",\"name\":\"\"}}}),status:'valid'}}];}catch(e){return [{json:{status:'invalid',message:'No se creó una cita. '+e.message}}];}"
    }
  },
  "output": [
    {
      "status": "valid"
    }
  ]
});
const n2 = node({
  "type": "n8n-nodes-base.if",
  "version": 2.4,
  "config": {
    "name": "¿Datos válidos?",
    "parameters": {
      "conditions": {
        "options": {
          "caseSensitive": true,
          "leftValue": "",
          "typeValidation": "strict",
          "version": 2
        },
        "conditions": [
          {
            "id": "¿Datos válidos?",
            "leftValue": expr("{{ $json.status }}"),
            "rightValue": "valid",
            "operator": {
              "type": "string",
              "operation": "equals"
            }
          }
        ],
        "combinator": "and"
      },
      "options": {}
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
    "name": "Buscar propuesta previa",
    "parameters": {
      "resource": "row",
      "operation": "get",
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
            "keyName": "operationKey",
            "condition": "eq",
            "keyValue": expr("{{ $('Validar propuesta').first().json.proposal.operationKey }}")
          }
        ]
      },
      "returnAll": false,
      "limit": 20
    },
    "alwaysOutputData": true
  },
  "output": [
    {}
  ]
});
const n4 = node({
  "type": "n8n-nodes-base.code",
  "version": 2,
  "config": {
    "name": "Comprobar propuesta previa",
    "parameters": {
      "mode": "runOnceForAllItems",
      "jsCode": "\nconst found=$input.all().find(i=>i.json.operationKey)?.json;if(found)return [{json:{status:'duplicate',message:'Este turno ya tiene una propuesta registrada. No repetiré la creación; revisa el calendario o envía un nuevo pedido.'}}];return [{json:{status:'new',proposal:$('Validar propuesta').first().json.proposal}}];"
    }
  },
  "output": [
    {
      "status": "valid"
    }
  ]
});
const n5 = node({
  "type": "n8n-nodes-base.if",
  "version": 2.4,
  "config": {
    "name": "¿Propuesta nueva?",
    "parameters": {
      "conditions": {
        "options": {
          "caseSensitive": true,
          "leftValue": "",
          "typeValidation": "strict",
          "version": 2
        },
        "conditions": [
          {
            "id": "¿Propuesta nueva?",
            "leftValue": expr("{{ $json.status }}"),
            "rightValue": "new",
            "operator": {
              "type": "string",
              "operation": "equals"
            }
          }
        ],
        "combinator": "and"
      },
      "options": {}
    }
  },
  "output": [
    {}
  ]
});
const n6 = node({
  "type": "n8n-nodes-base.dataTable",
  "version": 1.1,
  "config": {
    "name": "Registrar propuesta",
    "parameters": {
      "resource": "row",
      "operation": "upsert",
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
            "keyName": "operationKey",
            "condition": "eq",
            "keyValue": expr("{{ $('Validar propuesta').first().json.proposal.operationKey }}")
          }
        ]
      },
      "columns": {
        "mappingMode": "defineBelow",
        "value": {
          "operationKey": expr("{{ $('Validar propuesta').first().json.proposal.operationKey }}"),
          "sessionKey": expr("{{ $('Validar propuesta').first().json.proposal.sessionKey }}"),
          "kind": "proposal",
          "status": "pending",
          "eventId": expr("{{ $('Validar propuesta').first().json.proposal.eventId }}"),
          "result_object": "{}",
          "expiresAt": expr("{{ $('Validar propuesta').first().json.proposal.expiresAt }}")
        },
        "schema": [
          {
            "id": "operationKey",
            "displayName": "operationKey",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "sessionKey",
            "displayName": "sessionKey",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "kind",
            "displayName": "kind",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "status",
            "displayName": "status",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "eventId",
            "displayName": "eventId",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "result_object",
            "displayName": "result_object",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "expiresAt",
            "displayName": "expiresAt",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "dateTime",
            "canBeUsedToMatch": true
          }
        ]
      }
    }
  },
  "output": [
    {}
  ]
});
const n7 = node({
  "type": "n8n-nodes-base.telegram",
  "version": 1.2,
  "config": {
    "name": "Aprobar en Telegram",
    "parameters": {
      "resource": "message",
      "operation": "sendAndWait",
      "chatId": expr("{{ $('Validar propuesta').first().json.proposal.chatId }}"),
      "message": expr("{{ $('Validar propuesta').first().json.proposal.approvalMessage }}"),
      "responseType": "approval",
      "chatApproval": true,
      "postDecisionBehavior": "showOutcome",
      "approvalOptions": {
        "values": {
          "approvalType": "double",
          "approveLabel": "✅ Sí, crear cita",
          "disapproveLabel": "❌ No crear"
        }
      },
      "options": {
        "appendAttribution": false,
        "limitWaitTime": {
          "values": {
            "limitType": "afterTimeInterval",
            "resumeAmount": 10,
            "resumeUnit": "minutes"
          }
        }
      }
    },
    "onError": "continueRegularOutput"
  },
  "output": [
    {}
  ]
});
const n8 = node({
  "type": "n8n-nodes-base.code",
  "version": 2,
  "config": {
    "name": "Comprobar aprobación",
    "parameters": {
      "mode": "runOnceForAllItems",
      "jsCode": "function approvalDecision(response, proposal, now = Date.now()) {\n  if (Date.parse(proposal.approvalExpiresAt)<=now || Date.parse(proposal.start)<=now) {\n    return { status:'expired',message:'La propuesta venció. Envíame nuevamente el día y la hora.' };\n  }\n  // A Telegram failure is reported as an error, never as the person's «No»; both fail closed.\n  if (response?.error) {\n    return { status:'error',message:'No pude enviar los botones de confirmación por Telegram, así que no creé la cita. Inténtalo de nuevo en unos minutos.' };\n  }\n  if (response?.data?.approved!==true) {\n    return { status:'declined',message:'No se creó la cita. ¿Qué deseas cambiar?' };\n  }\n  return { status:'approved',message:'Aprobación recibida.' };\n}\nreturn [{json:approvalDecision($input.first().json,$('Validar propuesta').first().json.proposal)}];"
    }
  },
  "output": [
    {
      "status": "valid"
    }
  ]
});
const n9 = node({
  "type": "n8n-nodes-base.if",
  "version": 2.4,
  "config": {
    "name": "¿Aprobación vigente?",
    "parameters": {
      "conditions": {
        "options": {
          "caseSensitive": true,
          "leftValue": "",
          "typeValidation": "strict",
          "version": 2
        },
        "conditions": [
          {
            "id": "¿Aprobación vigente?",
            "leftValue": expr("{{ $json.status }}"),
            "rightValue": "approved",
            "operator": {
              "type": "string",
              "operation": "equals"
            }
          }
        ],
        "combinator": "and"
      },
      "options": {}
    }
  },
  "output": [
    {}
  ]
});
const n10 = node({
  "type": "n8n-nodes-base.googleCalendar",
  "version": 1.3,
  "config": {
    "name": "Consultar libre ocupado",
    "parameters": {
      "resource": "calendar",
      "operation": "availability",
      "calendar": {
        "__rl": true,
        "mode": "list",
        "value": "REPLACE_FIXED_CALENDAR_ID",
        "cachedResultName": "Calendario del taller"
      },
      "timeMin": expr("{{ $('Validar propuesta').first().json.proposal.start }}"),
      "timeMax": expr("{{ $('Validar propuesta').first().json.proposal.end }}"),
      "options": {
        "outputFormat": "availability",
        "timezone": {
          "__rl": true,
          "mode": "id",
          "value": "America/Guayaquil"
        }
      }
    },
    "onError": "continueRegularOutput"
  },
  "output": [
    {}
  ]
});
const n11 = node({
  "type": "n8n-nodes-base.code",
  "version": 2,
  "config": {
    "name": "Comprobar disponibilidad",
    "parameters": {
      "mode": "runOnceForAllItems",
      "jsCode": "function availabilityDecision(response) {\n  return response?.available===true ? { status:'free' } :\n    {status:'busy',message:'No pude confirmar que el horario esté libre. No creé una cita; indica otra hora o vuelve a consultar más tarde.'};\n}\nreturn [{json:availabilityDecision($input.first().json)}];"
    }
  },
  "output": [
    {
      "status": "valid"
    }
  ]
});
const n12 = node({
  "type": "n8n-nodes-base.if",
  "version": 2.4,
  "config": {
    "name": "¿Está libre?",
    "parameters": {
      "conditions": {
        "options": {
          "caseSensitive": true,
          "leftValue": "",
          "typeValidation": "strict",
          "version": 2
        },
        "conditions": [
          {
            "id": "¿Está libre?",
            "leftValue": expr("{{ $json.status }}"),
            "rightValue": "free",
            "operator": {
              "type": "string",
              "operation": "equals"
            }
          }
        ],
        "combinator": "and"
      },
      "options": {}
    }
  },
  "output": [
    {}
  ]
});
const n13 = node({
  "type": "n8n-nodes-base.googleCalendar",
  "version": 1.3,
  "config": {
    "name": "Crear evento aprobado",
    "parameters": {
      "resource": "event",
      "operation": "create",
      "calendar": {
        "__rl": true,
        "mode": "list",
        "value": "REPLACE_FIXED_CALENDAR_ID",
        "cachedResultName": "Calendario del taller"
      },
      "start": expr("{{ $('Validar propuesta').first().json.proposal.start }}"),
      "end": expr("{{ $('Validar propuesta').first().json.proposal.end }}"),
      "useDefaultReminders": false,
      "remindersUi": {
        "remindersValues": []
      },
      "additionalFields": {
        "summary": expr("{{ $('Validar propuesta').first().json.proposal.summary }}"),
        "id": expr("{{ $('Validar propuesta').first().json.proposal.eventId }}"),
        "sendUpdates": "none",
        "guestsCanInviteOthers": false,
        "guestsCanModify": false,
        "guestsCanSeeOtherGuests": false
      }
    },
    "onError": "continueRegularOutput",
    "retryOnFail": false
  },
  "output": [
    {}
  ]
});
const n14 = node({
  "type": "n8n-nodes-base.code",
  "version": 2,
  "config": {
    "name": "Verificar creación",
    "parameters": {
      "mode": "runOnceForAllItems",
      "jsCode": "function calendarDecision(response, proposal) {\n  // No `URL`: the n8n Code sandbox does not expose it, so a real event was reported as uncertain.\n  const link=typeof response?.htmlLink==='string'?response.htmlLink:'';\n  // Executions are not saved, so the first failed check is kept as a short code for diagnosis.\n  const reason=response?.error?'error':response?.id!==proposal.eventId?'id':response?.status==='cancelled'?'cancelled':\n    !/^https:\\/\\/(?:calendar|www)\\.google\\.com\\/[^\\s]*$/.test(link)?'link':\n    Date.parse(response?.start?.dateTime)!==Date.parse(proposal.start)?'start':\n    Date.parse(response?.end?.dateTime)!==Date.parse(proposal.end)?'end':'';\n  if (!reason) return {status:'created',message:'Cita creada con aprobación.',eventId:response.id,eventUrl:response.htmlLink};\n  return {status:'uncertain',reason,message:'No puedo confirmar el resultado. Revisa Google Calendar antes de volver a intentarlo.'};\n}\nreturn [{json:calendarDecision($input.first().json,$('Validar propuesta').first().json.proposal)}];"
    }
  },
  "output": [
    {
      "status": "valid"
    }
  ]
});
const n15 = node({
  "type": "n8n-nodes-base.code",
  "version": 2,
  "config": {
    "name": "Normalizar resultado",
    "parameters": {
      "mode": "runOnceForAllItems",
      "jsCode": "function publicResult(result) {\n  const allowed=['created','declined','expired','busy','invalid','uncertain','duplicate','error'];\n  if (!allowed.includes(result?.status)) return {status:'uncertain',message:'No se pudo confirmar el resultado; revisa el calendario antes de repetir.'};\n  return {status:result.status,message:String(result.message??''),\n    ...(result.status==='created'?{eventId:result.eventId,eventUrl:result.eventUrl}:{}),\n    ...(result.status==='uncertain'&&['error','id','cancelled','link','start','end'].includes(result.reason)?{reason:result.reason}:{})};\n}\nreturn [{json:publicResult($input.first().json)}];"
    }
  },
  "output": [
    {
      "status": "valid"
    }
  ]
});
const n16 = node({
  "type": "n8n-nodes-base.dataTable",
  "version": 1.1,
  "config": {
    "name": "Guardar resultado",
    "parameters": {
      "resource": "row",
      "operation": "upsert",
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
            "keyName": "operationKey",
            "condition": "eq",
            "keyValue": expr("{{ $('Validar propuesta').first().json.proposal.operationKey }}")
          }
        ]
      },
      "columns": {
        "mappingMode": "defineBelow",
        "value": {
          "operationKey": expr("{{ $('Validar propuesta').first().json.proposal.operationKey }}"),
          "sessionKey": expr("{{ $('Validar propuesta').first().json.proposal.sessionKey }}"),
          "kind": "proposal",
          "status": expr("{{ $('Normalizar resultado').first().json.status }}"),
          "eventId": expr("{{ $('Validar propuesta').first().json.proposal.eventId }}"),
          "result_object": expr("{{ JSON.stringify($('Normalizar resultado').first().json) }}"),
          "expiresAt": expr("{{ $('Validar propuesta').first().json.proposal.expiresAt }}")
        },
        "schema": [
          {
            "id": "operationKey",
            "displayName": "operationKey",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "sessionKey",
            "displayName": "sessionKey",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "kind",
            "displayName": "kind",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "status",
            "displayName": "status",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "eventId",
            "displayName": "eventId",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "result_object",
            "displayName": "result_object",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "string",
            "canBeUsedToMatch": true
          },
          {
            "id": "expiresAt",
            "displayName": "expiresAt",
            "required": false,
            "defaultMatch": false,
            "display": true,
            "type": "dateTime",
            "canBeUsedToMatch": true
          }
        ]
      }
    }
  },
  "output": [
    {}
  ]
});
const n17 = node({
  "type": "n8n-nodes-base.code",
  "version": 2,
  "config": {
    "name": "Devolver resultado",
    "parameters": {
      "mode": "runOnceForAllItems",
      "jsCode": "\nreturn [{json:$('Normalizar resultado').first().json}];"
    }
  },
  "output": [
    {
      "status": "valid"
    }
  ]
});
const n18 = node({
  "type": "n8n-nodes-base.code",
  "version": 2,
  "config": {
    "name": "Devolver rechazo",
    "parameters": {
      "mode": "runOnceForAllItems",
      "jsCode": "function publicResult(result) {\n  const allowed=['created','declined','expired','busy','invalid','uncertain','duplicate','error'];\n  if (!allowed.includes(result?.status)) return {status:'uncertain',message:'No se pudo confirmar el resultado; revisa el calendario antes de repetir.'};\n  return {status:result.status,message:String(result.message??''),\n    ...(result.status==='created'?{eventId:result.eventId,eventUrl:result.eventUrl}:{}),\n    ...(result.status==='uncertain'&&['error','id','cancelled','link','start','end'].includes(result.reason)?{reason:result.reason}:{})};\n}\nreturn [{json:publicResult($input.first().json)}];"
    }
  },
  "output": [
    {
      "status": "valid"
    }
  ]
});
export default workflow('workshop-backup', "Taller citas · agenda protegida")
  .add(n0.output(0).to(n1.input(0)))
  .add(n1.output(0).to(n2.input(0)))
  .add(n2.output(0).to(n3.input(0)))
  .add(n2.output(1).to(n18.input(0)))
  .add(n3.output(0).to(n4.input(0)))
  .add(n4.output(0).to(n5.input(0)))
  .add(n5.output(0).to(n6.input(0)))
  .add(n5.output(1).to(n18.input(0)))
  .add(n6.output(0).to(n7.input(0)))
  .add(n7.output(0).to(n8.input(0)))
  .add(n8.output(0).to(n9.input(0)))
  .add(n9.output(0).to(n10.input(0)))
  .add(n9.output(1).to(n15.input(0)))
  .add(n10.output(0).to(n11.input(0)))
  .add(n11.output(0).to(n12.input(0)))
  .add(n12.output(0).to(n13.input(0)))
  .add(n12.output(1).to(n15.input(0)))
  .add(n13.output(0).to(n14.input(0)))
  .add(n14.output(0).to(n15.input(0)))
  .add(n15.output(0).to(n16.input(0)))
  .add(n16.output(0).to(n17.input(0)));
