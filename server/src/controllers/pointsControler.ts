import {Request,Response} from 'express';
import knex from '../database/connection';
class PointsController {
async index(request:Request,response:Response){

    const {city,uf,items} = request.query;

    const parsedItems = 
    String(items).split(',')
    .map(item=>Number(item.trim()));

    const points = await knex('points')
    .join('point_itens','points.id','=','point_itens.point_id')
    .whereIn('point_itens.item_id',parsedItems)
    .where('city',String(city))
    .where('uf',String(uf))
    .distinct()
    .select('points.*')

    return response.json(points);
}
    async create(request:Request,response:Response){
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

    const trx = await knex.transaction();
    const point = {
    image:'https://images.unsplash.com/photo-1582401656474-b65e06392a03?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
    name,
    email,
    whatsapp,
    latitude,
    longitude,
    city,
    uf }
const insertedsIds = await  trx('points').insert(point);
        const point_id = insertedsIds[0]

const pointItems = items.map((item_id:number) =>{
            return {
                item_id,
                point_id
            };
        });

        await trx('point_itens').insert(pointItems);
        await trx.commit();
    return response.json({
        point_id,
        ...point,

    });
}

async show(request:Request,response:Response){
   
    const {id} = request.params;
    const point = await knex('points').where('id',id).first();
    if(!point){
        return response.status(400).json({message:'Point not found'})    ;
    }
    const items = await knex('itens')
    .join('point_itens','itens.id','=','point_itens.item_id')
    .where('point_itens.point_id',id)
    .select('itens.title');

    return response.json({point,items});
}

}

export default PointsController;