const { Parser } = require('node-sql-parser');
const jsonbeautify = require('json-beautify');
const mysql = require('mysql2/promise');
const parser = new Parser();
const beautify = json => jsonbeautify(json, null, 2, 100)
// const fixAst = (ast) => {
//     if (ast.type == 'select') {}
//     return ast
// }
const fixSQL = q => {
    const ast = parser.astify(q);
    //const newast = fixAst(ast)
    //console.log(beautify(ast))
    return parser.sqlify(ast);
}
/*

ALTER TABLE `detail_queries` ADD `ora_text` text NULL,
ADD `convert_err` text NULL;

*/
const main = async () => {
    try{
    const con = await mysql.createConnection({ host: '127.0.0.1', user: 'root', database: 'filterdb'
        , password: '***' });
    const [rows, fields] = await con.query('select id,sql_text from detail_queries');
    await con.beginTransaction()
    for(let row of rows){
        console.log(row.id)
        try{
            let newSql=fixSQL(row.sql_text)
            await con.query('update detail_queries set convert_err=null, ora_text=? where id=?',[newSql,row.id])
        }catch(err){
            await con.query('update detail_queries set convert_err=? where id=?',[String(err),row.id]) 
        }
    }
     await con.commit()
    }catch(err){
        console.log(String(err))
    }
    process.exit(0)
}
main()

