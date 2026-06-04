'use strict';

const BCCR_USD_SELL_INDICATOR = 318;

function todayCostaRica() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Costa_Rica',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function toBccrDate(date) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function parseBccrValue(xml) {
  const match = xml.match(/<NUM_VALOR>\s*([0-9.,]+)\s*<\/NUM_VALOR>/i);
  if (!match) return null;
  return Number(match[1].replace(',', '.'));
}

function parseBccrHomeSellRate(html) {
  const match = html.match(/Venta\s+USD₡\s*([0-9.,]+)/i);
  if (!match) return null;
  return Number(match[1].replace('.', '').replace(',', '.'));
}

async function fetchBccrUsdSellRate(date = todayCostaRica()) {
  const email = process.env.BCCR_EMAIL;
  const token = process.env.BCCR_TOKEN;
  if (!email || !token) return null;

  const bccrDate = toBccrDate(date);
  const url = new URL('https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicos');
  url.searchParams.set('Indicador', String(BCCR_USD_SELL_INDICATOR));
  url.searchParams.set('FechaInicio', bccrDate);
  url.searchParams.set('FechaFinal', bccrDate);
  url.searchParams.set('Nombre', 'AplicacionGastos');
  url.searchParams.set('SubNiveles', 'N');
  url.searchParams.set('CorreoElectronico', email);
  url.searchParams.set('Token', token);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`BCCR no respondió correctamente: ${response.status}`);
  }

  const xml = await response.text();
  return parseBccrValue(xml);
}

async function getUsdSellRate() {
  const date = todayCostaRica();
  try {
    const bccrRate = await fetchBccrUsdSellRate(date);
    if (bccrRate) {
      return { date, rate: bccrRate, source: 'BCCR', indicator: BCCR_USD_SELL_INDICATOR };
    }
  } catch {
    // Fall back to public indicator or manual env rate.
  }

  try {
    const response = await fetch('https://www.bccr.fi.cr/');
    if (response.ok) {
      const html = await response.text();
      const homeRate = parseBccrHomeSellRate(html);
      if (homeRate) {
        return { date, rate: homeRate, source: 'BCCR-public', indicator: BCCR_USD_SELL_INDICATOR };
      }
    }
  } catch {
    // Local development can still use the manual fallback below.
  }

  const manualRate = Number(process.env.BCCR_USD_SELL_RATE || process.env.USD_CRC_RATE || 0);
  if (manualRate > 0) {
    return { date, rate: manualRate, source: 'env', indicator: BCCR_USD_SELL_INDICATOR };
  }

  return { date, rate: null, source: 'missing', indicator: BCCR_USD_SELL_INDICATOR };
}

module.exports = { getUsdSellRate };
