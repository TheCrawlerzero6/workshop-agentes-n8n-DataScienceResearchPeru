// Pure functions shared by generated Code nodes and offline behavioral tests.
export function requireReady(c) {
  if (c.ready !== true ||
      !c.botKey || !c.calendarId || c.calendarId.startsWith('REPLACE_') ||
      !c.historyTableId || c.historyTableId.startsWith('REPLACE_') ||
      !c.operationsTableId || c.operationsTableId.startsWith('REPLACE_')) {
    throw new Error('Configuración pendiente: completa el preflight y la revisión antes de ejecutar.');
  }
  new Intl.DateTimeFormat('es', { timeZone: c.timezone }).format();
  return c;
}

// Open bot: anyone may write, but only from a private chat with a person (not a bot).
// Each sender gets their own session, and only the sender can approve their appointment.
export function guardMessage(update, c, now = Date.now()) {
  requireReady(c);
  const m = update?.message;
  const chatId = String(m?.chat?.id ?? '');
  if (!m || m.chat?.type !== 'private' || m.from?.is_bot === true || !/^\d+$/.test(chatId) ||
      String(m.from?.id) !== chatId || typeof m.text !== 'string' || !m.text.trim() ||
      !Number.isSafeInteger(update.update_id) || update.update_id < 0) return null;
  if (m.text.length > 4000) return null;
  const sessionKey = `${c.botKey}:${chatId}`;
  const requester = String(m.from?.first_name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 40);
  return { sessionKey, turnKey: `${sessionKey}:${update.update_id}`, chatId, requester, text: m.text,
    expiresAt: new Date(now + 7 * 86400000).toISOString() };
}

export function recentMessages(rows, sessionKey, now = Date.now()) {
  return rows.filter(r => r.sessionKey === sessionKey && Date.parse(r.expiresAt) > now &&
    ['user', 'ai'].includes(r.role) && typeof r.content === 'string')
    .sort((a,b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || Number(a.id) - Number(b.id))
    .slice(-20).map(r => ({ type: r.role, message: r.content }));
}

export function stableEventId(turnKey) {
  // Non-cryptographic deterministic identifier; hex is a subset of Calendar base32hex.
  let a=0x811c9dc5,b=0x9e3779b9,c=0x85ebca6b,d=0xc2b2ae35;
  for (const ch of turnKey) {
    const n=ch.codePointAt(0); a=Math.imul(a^n,16777619); b=Math.imul(b^n,2246822519);
    c=Math.imul(c^n,3266489917); d=Math.imul(d^n,668265263);
  }
  return 'c'+[a,b,c,d].map(n=>(n>>>0).toString(16).padStart(8,'0')).join('');
}

export function validateProposal(input, c, now = Date.now()) {
  requireReady(c);
  // The session comes from the verified sender, never from the model: it fixes who approves.
  const prefix=`${c.botKey}:`, sessionKey=input.sessionKey, chatId=String(sessionKey??'').slice(prefix.length);
  if (typeof sessionKey !== 'string' || !sessionKey.startsWith(prefix) || !/^\d+$/.test(chatId) ||
      typeof input.turnKey !== 'string' || !input.turnKey.startsWith(`${sessionKey}:`) ||
      !/^\d+$/.test(input.turnKey.slice(sessionKey.length+1))) {
    throw new Error('Contexto de sesión no autorizado.');
  }
  if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 200) {
    throw new Error('Falta un título válido de hasta 200 caracteres.');
  }
  const iso=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/;
  if (typeof input.start!=='string'||typeof input.end!=='string'||!iso.test(input.start)||!iso.test(input.end)) {
    throw new Error('Las fechas deben incluir día, hora y zona horaria explícitos.');
  }
  const start=Date.parse(input.start), end=Date.parse(input.end);
  // Reject calendar rollover (e.g. February 30) using the offset's local date.
  for (const value of [input.start,input.end]) {
    const datePart=value.slice(0,10), local=value.slice(0,-(value.endsWith('Z')?1:6))+'Z';
    const t=Date.parse(local);
    if (!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==datePart) throw new Error('Fecha inexistente.');
  }
  if (!Number.isFinite(start)||!Number.isFinite(end)||start<=now||end<=start) {
    throw new Error('El inicio debe ser futuro y el fin posterior al inicio.');
  }
  const title=input.title.trim().replace(/[\r\n\t]/g,' ');
  const requester=typeof input.requester==='string'?input.requester.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,40):'';
  // Several people share the calendar: the event name says who asked for it.
  const summary=/[\p{L}\p{N}]/u.test(requester)?`${title} (${requester})`:title;
  const eventId=stableEventId(input.turnKey);
  const fmt=new Intl.DateTimeFormat('es-EC',{timeZone:c.timezone,dateStyle:'full',timeStyle:'short'});
  // Send-and-wait uses legacy Markdown. Escape delimiters; preserve the exact title.
  const display=title.replace(/[\\_*`\[]/g,ch=>'\\'+ch);
  return { title, start:new Date(start).toISOString(), end:new Date(end).toISOString(),
    summary, chatId, sessionKey, turnKey:input.turnKey, operationKey:`proposal:${input.turnKey}`, eventId,
    expiresAt:new Date(now+7*86400000).toISOString(),
    approvalExpiresAt:new Date(now+10*60000).toISOString(),
    approvalMessage:`¿Creo esta cita?\n${display}\nInicio: ${fmt.format(start)}\nFin: ${fmt.format(end)}\nZona: ${c.timezone}\nDuración: ${(end-start)/60000} minutos\nNo se enviarán invitaciones.` };
}

export function approvalDecision(response, proposal, now = Date.now()) {
  if (Date.parse(proposal.approvalExpiresAt)<=now || Date.parse(proposal.start)<=now) {
    return { status:'expired',message:'La propuesta venció. Envíame nuevamente el día y la hora.' };
  }
  // A Telegram failure is reported as an error, never as the person's «No»; both fail closed.
  if (response?.error) {
    return { status:'error',message:'No pude enviar los botones de confirmación por Telegram, así que no creé la cita. Inténtalo de nuevo en unos minutos.' };
  }
  if (response?.data?.approved!==true) {
    return { status:'declined',message:'No se creó la cita. ¿Qué deseas cambiar?' };
  }
  return { status:'approved',message:'Aprobación recibida.' };
}

export function availabilityDecision(response) {
  return response?.available===true ? { status:'free' } :
    {status:'busy',message:'No pude confirmar que el horario esté libre. No creé una cita; indica otra hora o vuelve a consultar más tarde.'};
}

export function calendarDecision(response, proposal) {
  // No `URL`: the n8n Code sandbox does not expose it, so a real event was reported as uncertain.
  const link=typeof response?.htmlLink==='string'?response.htmlLink:'';
  // Executions are not saved, so the first failed check is kept as a short code for diagnosis.
  const reason=response?.error?'error':response?.id!==proposal.eventId?'id':response?.status==='cancelled'?'cancelled':
    !/^https:\/\/(?:calendar|www)\.google\.com\/[^\s]*$/.test(link)?'link':
    Date.parse(response?.start?.dateTime)!==Date.parse(proposal.start)?'start':
    Date.parse(response?.end?.dateTime)!==Date.parse(proposal.end)?'end':'';
  if (!reason) return {status:'created',message:'Cita creada con aprobación.',eventId:response.id,eventUrl:response.htmlLink};
  return {status:'uncertain',reason,message:'No puedo confirmar el resultado. Revisa Google Calendar antes de volver a intentarlo.'};
}

export function publicResult(result) {
  const allowed=['created','declined','expired','busy','invalid','uncertain','duplicate','error'];
  if (!allowed.includes(result?.status)) return {status:'uncertain',message:'No se pudo confirmar el resultado; revisa el calendario antes de repetir.'};
  return {status:result.status,message:String(result.message??''),
    ...(result.status==='created'?{eventId:result.eventId,eventUrl:result.eventUrl}:{}),
    ...(result.status==='uncertain'&&['error','id','cancelled','link','start','end'].includes(result.reason)?{reason:result.reason}:{})};
}

export function runtimeSource(code) {
  const all=[requireReady,guardMessage,recentMessages,stableEventId,validateProposal,approvalDecision,
    availabilityDecision,calendarDecision,publicResult];
  if(code===undefined)return all.map(f=>f.toString()).join('\n');
  const names=new Set(all.filter(f=>code.includes(f.name+'(')).map(f=>f.name));
  if(names.has('guardMessage')||names.has('validateProposal'))names.add('requireReady');
  if(names.has('validateProposal'))names.add('stableEventId');
  return all.filter(f=>names.has(f.name)).map(f=>f.toString()).join('\n');
}
