import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://examDB_owner:npg_a6rE8wiAfNIm@ep-orange-frog-a9xlz54q-pooler.gwc.azure.neon.tech/examDB?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

export default pool;