const BATCH_STRENGTH = await tf.loadLayersModel("model/tfjs_cs/model.json");
const BATCH_COMPACT = await tf.loadLayersModel("model/tfjs_comp/model.json");

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

    /*
    var GFD_30 = 0.1;
    var GFD_40 = 0.9;
    var GFD_50 = 4.3;
    var GFD_70 = 16.7;
    var GFD_100 = 9.5;
    var GFD_140 = 1.1;
    var GFD_200 = 0.2;
    var GFD_270 = 0.1;
    var pan = 0.09;
    var afs_clay = 10.68;
    var afs_grain = 53.5524;
    var batch_moisture = 0;
    var batch_temperature = 10.4053;
    var batch_batch = 0;
    var batch_bentonite = 0;
    var batch_dust = 0;
    var batch_sand = 0;
    var batch_water = 0;
    */

    var GFD_30 = 0.1;
    var GFD_40 = 1.5;
    var GFD_50 = 7.5;
    var GFD_70 = 20.1;
    var GFD_100 = 11.6;
    var GFD_140 = 1.8;
    var GFD_200 = 0.5;
    var GFD_270 = 0.3;
    var pan = 0.17;
    var afs_clay = 13.12;
    var afs_grain = 57.6542;
    var batch_moisture = 0;
    var batch_temperature = 31.9476;
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
    for(var i=0; i<13; i++){
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

    console.log(data_list);

    const normalizationBounds = [
        [0.1, 0.5], //GFD-30
        [0.9, 3.3], //GFD-40
        [4.3, 10.7], //GFD-50
        [16.7, 20.9], //GFD-70
        [9.5, 16.7], //GFD-100
        [1.1, 2.8], //GFD-140
        [0.2, 0.9], //GFD-200
        [0.1, 0.4], //GFD-270
        [0.09, 0.29], //Pan
        [10.68, 16.26], //AFS Clay
        [53.5524, 63.1717], //AFS Grain
        [3, 4], //BATCH_Moisture
        [10, 45], //BATCH_TEMP
        [962.6015, 1150.152], //BATCH_BATCH
        [15, 20], //BATCH_BENTONITE
        [3.5, 5], //BATCH_DUST
        [5, 13], //BATCH_SAND
        [14, 20] //BATCH_WATER
    ];

    function normalizeValue(value, index) {
        const [min, max] = normalizationBounds[index];
        return (value - min) / (max - min);
    }
    
    for (var i = 0; i < 18; i++) {
        data_list[i] = normalizeValue(data_list[i], i);
    }

    console.log(data_list);

    var s_index = 0;
    var score_array = new Array;
    var cs_array = new Array;
    var result_data = new Array;
    var total_point = 0;

    var test_array = new Array;

    for(var j=0;j<1000;j++){
        const rand_list = [];

        for(var i=0; i<6; i++){
            const rand = Math.random();
            rand_list.push(parseFloat(rand));
        }

        batch_moisture = parseFloat(rand_list[0].toFixed(4));
        batch_batch = parseFloat(rand_list[1].toFixed(4));
        batch_bentonite = parseFloat(rand_list[2].toFixed(4));
        batch_dust = parseFloat(rand_list[3].toFixed(4));
        batch_sand = parseFloat(rand_list[4].toFixed(4));
        batch_water = parseFloat(rand_list[5].toFixed(4));

        data_list[11] = batch_moisture;
        data_list[13] = batch_batch;
        data_list[14] = batch_bentonite;
        data_list[15] = batch_dust;
        data_list[16] = batch_sand;
        data_list[17] = batch_water;
        
        console.log(data_list);

        let res_strength = BATCH_STRENGTH.predict(tf.tensor(data_list, [1,data_list.length])).arraySync();
        let res_compact = BATCH_COMPACT.predict(tf.tensor(data_list, [1,data_list.length])).arraySync();

        var pre_str = parseFloat(res_strength).toFixed(3);
        var pre_com = parseFloat(res_compact).toFixed(3);

        var strength_l = strength * 0.9;
        var strength_h = strength * 1.1;

        var compactability_l = compactability * 0.9;
        var compactability_h = compactability * 1.1;

        //console.log(pre_str, strength_l);
        //console.log(pre_com, compactability_l);

        if(pre_str>strength_l){
            if(pre_str<strength_h){
                if(pre_com>compactability_l){
                    if(pre_com<compactability_h){

                        cs_point = (batch_bentonite * 0.4) + (batch_sand * 0.3) + (batch_water * 0.2) - (batch_dust * 0.1);
                        comp_point = -(batch_dust * 0.4) + (batch_sand * 0.3) + (batch_bentonite * 0.2) - (batch_water * 0.1);
                        total_point = cs_point + comp_point;

                        score_array.push([total_point, s_index]);
                        cs_array.push([cs_point, s_index]);
                        result_data.push([batch_bentonite, batch_dust, batch_sand, batch_water, batch_batch, pre_str, pre_com]);

                        test_array.push([total_point, cs_point, s_index]);

                        s_index++;

                        //console.log(score_array);
                        //console.log(cs_array);
                        //console.log(result_data);
                        //console.log(s_index);

                    }
                }
            }
        }
    }

    var result_index = 0;

    test_array.sort(function (a, b){
        if(a[0] < b[0]) return 1;
        if(a[0] > b[0]) return -1;
        
        if(a[1] < b[1]) return 1;
        if(a[1] > b[1]) return -1;
    })

    //console.log("testarr", test_array);

    var output_list = [];

    const denormalizationBounds = [
        [15, 20], //bentonite
        [3.5, 5], //dust
        [5, 13], //sand
        [14, 20], //water
        [900, 1150] //batch
    ];

    function denormalizeValue(normalizedValue, index) {
        const [min, max] = denormalizationBounds[index];
        return normalizedValue * (max - min) + min;
    }

    for(var num=0;num<11;num++){   

        if (test_array.length === 0) {
            alert("조건에 맞는 검색 결과가 없습니다!");
            break;
        }        

        result_index = test_array[num][2];

        //console.log("re",result_index);
        let test_arr = result_data[result_index].map(parseFloat);
        //console.log(test_arr);

        for (var i = 0; i < 5; i++) {
            output_list[i] = denormalizeValue(test_arr[i], i);
        }

        console.log("out",output_list);
        
        batch_bentonite = output_list[0];
        batch_dust = output_list[1];
        batch_sand = output_list[2];
        batch_water = parseFloat(output_list[3]);
        batch_batch = parseFloat(output_list[4]);
        pre_str = parseFloat(test_arr[5]);
        pre_com = parseFloat(test_arr[6]);

        let table_data = "<tr id=table_list"+index+">";
        table_data += "<td>"+index+"</td>";
        table_data += "<td>"+batch_bentonite.toFixed(4)+"</td>";
        table_data += "<td>"+batch_dust.toFixed(4)+"</td>";
        table_data += "<td>"+batch_sand.toFixed(4)+"</td>";
        table_data += "<td>"+batch_water.toFixed(4)+"</td>";
        table_data += "<td>"+batch_batch.toFixed(4)+"</td>";
        table_data += "<td>"+pre_str.toFixed(4)+"</td>";
        table_data += "<td>"+pre_com.toFixed(4)+"</td>";
        table_data += "<tr>";
    
        index++;
        $("#table_data > tbody").append(table_data);

    }
    
    alert("검색 완료");
    
})