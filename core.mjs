export const categories=['Aretes','Collares','Manillas'];
export const states=['Borrador','En revisión','Publicado','Agotado','Archivado'];
export const images=['ARETE ESCAMA.png','ARETE PLUMAS.jpg','COLLAR AMARILLO.jpg','COLLAR MARFIL.jpg','MANILLA AZUL.jpg','MANILLA LILA.png','MANILLA MARFIL.png'];
export const seed=[
 ['PKW-ARE-001','Arete Escama','Aretes',65,'Escamas y metal dorado'],
 ['PKW-ARE-002','Arete Plumas','Aretes',55,'Plumas y semillas'],
 ['PKW-COL-001','Collar Amarillo','Collares',180,'Semillas e hilo'],
 ['PKW-COL-002','Collar Marfil','Collares',150,'Materiales por confirmar'],
 ['PKW-MAN-001','Manilla Azul','Manillas',70,'Semillas e hilo'],
 ['PKW-MAN-002','Manilla Lila','Manillas',75,'Semillas e hilo'],
 ['PKW-MAN-003','Manilla Marfil','Manillas',80,'Materiales por confirmar']
].map((a,i)=>({sku:a[0],name:a[1],category:a[2],price:a[3],materials:a[4],stock:1,image:images[i],description:'Diseño del catálogo de demostración de PAKAWARA. Confirmar materiales, precio y disponibilidad antes de una venta real.',status:'Publicado',version:1}));
export function validate(p,items=[],original='') {
 const e=[];
 if(!/^PKW-[A-Z]{3}-\d{3}$/.test(p.sku||''))e.push('Código: use PKW-AAA-001.');
 if(items.some(x=>x.sku===p.sku&&x.sku!==original))e.push('El código ya existe.');
 if(!(p.name||'').trim())e.push('Escriba el nombre.');
 if(!categories.includes(p.category))e.push('Seleccione una categoría válida.');
 if(!Number.isFinite(p.price)||p.price<=0)e.push('El precio debe ser mayor que cero.');
 if(!Number.isInteger(p.stock)||p.stock<0)e.push('El stock debe ser un entero no negativo.');
 if(!(p.materials||'').trim()||!(p.description||'').trim())e.push('Complete materiales y descripción.');
 if(!images.includes(p.image))e.push('Seleccione una fotografía del catálogo.');
 return e;
}
export function saveProduct(items,p,role,original='') {
 if(role!=='Gestor')throw Error('Solo el gestor puede guardar fichas.');
 const old=items.find(x=>x.sku===original);
 if(old&&old.sku!==p.sku)throw Error('El código no se puede cambiar.');
 if(old&&!['Borrador','En revisión'].includes(old.status))throw Error('Retire la ficha a borrador antes de editar.');
 const e=validate(p,items,original); if(e.length)throw Error(e.join(' '));
 return {...p,status:'Borrador',version:(old?.version||0)+1};
}
export function transition(p,to,role) {
 if(role!=='Gestor')throw Error('Solo el gestor puede cambiar estados.');
 const allowed={Borrador:['En revisión','Archivado'],'En revisión':['Borrador','Publicado','Agotado'],Publicado:['Borrador','Archivado'],Agotado:['Borrador','Archivado'],Archivado:['Borrador']};
 if(!allowed[p.status]?.includes(to))throw Error('Transición no permitida.');
 const e=validate(p); if(e.length)throw Error(e.join(' '));
 if(to==='Publicado'&&p.stock===0)throw Error('Sin stock: marque Agotado o corrija la cantidad.');
 if(to==='Agotado'&&p.stock!==0)throw Error('Agotado requiere stock cero.');
 return {...p,status:to,version:p.version+1};
}
export function publicProducts(items) {return items.filter(p=>['Publicado','Agotado'].includes(p.status));}
export function integrationEvent(p,destination) {
 if(p.status!=='Publicado'||p.stock<1)throw Error('Solo un producto publicado con stock puede enviarse.');
 if(!['Pedidos','Chatbot'].includes(destination))throw Error('Destino no válido.');
 return {schemaVersion:1,event:'producto.seleccionado',destination,timestamp:new Date().toISOString(),product:{sku:p.sku,name:p.name,category:p.category,price:p.price,currency:'BOB',stock:p.stock,version:p.version},mode:'simulacion_sin_transmision'};
}
