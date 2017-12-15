export const html = (strings, ...parts) => strings.map((string, index) => string + ((parts[index] != undefined && parts[index].toString()) || '')).join('');
export const render = (template, target) => (target.innerHTML = template);
