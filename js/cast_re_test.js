const BATCH_STRENGTH = await tf.loadLayersModel("model/BATCH_STRENGTH/model.json");
const BATCH_COMPACT = await tf.loadLayersModel("model/BATCH_COMPACT/model.json");

let index = 1;
var option = 0;

const Calc_btn = document.getElementById('search_btn');
Calc_btn.addEventListener('click', function(e){

    $('#table_data > tbody > tr').remove();
    index = 1;

    var strength = $("#Compression_Strength").val();
    var compactability = $("#Compactability").val();

    if($("#Compression_Strength").val() == "" || $("#Compactability").val() == ""){
        alert("Desired Value를 입력해 주세요");
        return false;
    }

    var GFD_30 = 0;
    var GFD_40 = 0.25;
    var GFD_50 = 0.5;
    var GFD_70 = 0.81;
    var GFD_100 = 0.292;
    var GFD_140 = 0.412;
    var GFD_200 = 0.429;
    var GFD_270 = 0.667;
    var pan = 0;
    var afs_clay = 0;
    var afs_grain = 0;
    var batch_moisture = 0;
    var batch_temperature = 0;
    var batch_batch = 0;
    var batch_bentonite = 0;
    var batch_dust = 0;
    var batch_sand = 0;
    var batch_water = 0;
    var _low_, _high_ = 0;
    var cs_point = 0;
    var comp_point = 0;

    let input_list = ["GFD_30", "GFD_40", "GFD_50", "GFD_70", "GFD_100", "GFD_140", "GFD_200", "GFD_270", "Pan", "AFS_Clay_Content", "AFS_Grain_Fineness_No", "BATCH_MOISTURE", "BATCH_TEMPERATURE", "BATCH_BATCH", "BATCH_BENTONITE", "BATCH_DUST", "BATCH_SAND", "BATCH_WATER"];
    //let batch_list = ["BATCH_MOISTURE, BATCH_TEMPERATURE, BATCH_BATCH, BATCH_BENTONITE, BATCH_DUST, BATCH_SAND, BATCH_WATER"];
    let data_list = new Array();
    for(var i=0; i<18; i++){
        if(i<13){
            if($('#'+input_list[i]).val() == "") {
                switch(i){
                    case 0:
                        data_list[i] = GFD_30;
                        break;
                    case 1:
                        data_list[i] = GFD_40;
                        break;
                    case 2:
                        data_list[i] = GFD_50;
                        break;
                    case 3:
                        data_list[i] = GFD_70;
                        break;
                    case 4:
                        data_list[i] = GFD_100;
                        break;
                    case 5:
                        data_list[i] = GFD_140;
                        break;
                    case 6:
                        data_list[i] = GFD_200;
                        break;
                    case 7:
                        data_list[i] = GFD_270;
                        break;
                    case 8:
                        data_list[i] = pan;
                        break;
                    case 9:
                        data_list[i] = afs_clay;
                        break;
                    case 10:
                        data_list[i] = afs_grain;
                        break;
                    case 11:
                        data_list[i] = 1;
                        break;
                    case 12:
                        data_list[i] = batch_temperature;
                        break;    
                    default:
                        return false;
                }
            } else {
                data_list[i] = parseFloat($('#'+input_list[i]).val());
            }
        } 
    }
        
    for(var j=0; j<100; j++){

        const rand_list = [];

        for(var i=0; i<6; i++){
            const rand = Math.random();
            rand_list.push(parseFloat(rand));
        }

        batch_moisture = parseFloat(rand_list[0].toFixed(3));
        batch_batch = parseFloat(rand_list[1].toFixed(3));
        batch_bentonite = parseFloat(rand_list[2].toFixed(3));
        batch_dust = parseFloat(rand_list[3].toFixed(3));
        batch_sand = parseFloat(rand_list[4].toFixed(3));
        batch_water = parseFloat(rand_list[5].toFixed(3));
        
        data_list[11] = batch_moisture;
        data_list[13] = batch_batch;
        data_list[14] = batch_bentonite;
        data_list[15] = batch_dust;
        data_list[16] = batch_sand;
        data_list[17] = batch_water;

        console.log(data_list);
        let res_strength = BATCH_STRENGTH.predict(tf.tensor(data_list, [1,data_list.length])).arraySync();
        let res_compact = BATCH_COMPACT.predict(tf.tensor(data_list, [1,data_list.length])).arraySync();

        var str = parseFloat(res_strength).toFixed(3);
        var com = parseFloat(res_compact).toFixed(3);

        let table_data = "<tr id=table_list"+index+">";
        table_data += "<td>"+index+"</td>";
        table_data += "<td>"+batch_bentonite+"</td>";
        table_data += "<td>"+batch_dust+"</td>";
        table_data += "<td>"+batch_sand+"</td>";
        table_data += "<td>"+batch_water+"</td>";
        table_data += "<td>"+str+"</td>";
        table_data += "<td>"+com+"</td>";
        table_data += "<tr>";

        index++;
        $("#table_data > tbody").append(table_data)

        if(index>11){
            break;
        }

    }

})