import { DataSource } from 'typeorm';
import ormSeedconfig from '@app/ormseedconfig';

export default new DataSource(ormSeedconfig);
