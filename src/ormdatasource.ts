import { DataSource } from 'typeorm';
import ormconfig from '@app/ormconfig';

const ds = new DataSource(ormconfig);

export default ds;

export const dataSource = ds.initialize();
