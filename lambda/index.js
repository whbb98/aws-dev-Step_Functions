var
    AWS_SDK = require("aws-sdk"),
    S3_API = new AWS_SDK.S3({apiVersion: "2006-03-01"}),
    MYSQL = require("mysql2");

exports.handler = function(event, context, callback){

    var mysql = MYSQL.createConnection({
          host: 'supplierdb.cluster-cwxca1gblqzj.us-east-1.rds.amazonaws.com',
          password: 'coffee',
          user: 'nodeapp',
          database: 'COFFEE'
        });

    mysql.query('SELECT * from suppliers',function(err, results) {
        if(err){
            return callback(err, null);
        }

        var suppliers = results;

        mysql.query('SELECT * from beans',function(err, results) {
            if(err){
                return callback(err, null);
            }
            var beans = results;

            mysql.close();
            mergeData(suppliers, beans, callback);
        });
    });

  function mergeData(suppliers_arr, beans_arr, callback){
    var fine_tunes_data_arr = [];

    for(var i_int = 0; i_int < suppliers_arr.length; i_int += 1){
      var o = {};
      console.log(suppliers_arr[i_int].name);
      o.suppliers_id_int = suppliers_arr[i_int].id;
      o.supplier_name_str = suppliers_arr[i_int].name;
      o.supplier_address_str = suppliers_arr[i_int].address;
      o.supplier_phone_str = suppliers_arr[i_int].phone;
      o.bean_info_obj_arr = [];
      for(var j_int = 0; j_int < beans_arr.length; j_int += 1){
        if(suppliers_arr[i_int].id === beans_arr[j_int].supplier_id){
          var b = {
            type_str: beans_arr[j_int].type,
            product_name_str: beans_arr[j_int].product_name,
            quantity_int: beans_arr[j_int].quantity
          };
          o.bean_info_obj_arr.push(b);
        }
      }
      fine_tunes_data_arr.push(o);
    }

    callback(null, {
      my_json_arr: fine_tunes_data_arr
    });
  }
};