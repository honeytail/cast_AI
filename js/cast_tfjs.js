const BATCH_STRENGTH = await tf.loadLayersModel("model/tfjs_cs/model.json");
const BATCH_COMPACT = await tf.loadLayersModel("model/tfjs_comp/model.json");

const Calc_btn = document.getElementById('Cast_btn');
Calc_btn.addEventListener('click', function(e){

    const g_30 = 0.1;
    const g_40 = 0.9;
    const g_50 = 4.3;
    const g_70 = 16.7;
    const g_100 = 9.5;
    const g_140 = 1.1;
    const g_200 = 0.2;
    const g_270 = 0.1;
    const pan = 0.09;
    const afs_clay = 10.68;
    const afs_grain = 53.5524;

    let input_list = ["GFD_30", "GFD_40", "GFD_50", "GFD_70", "GFD_100", "GFD_140", "GFD_200", "GFD_270", "Pan", "AFS_Clay_Content", "AFS_Grain_Fineness_No", "BATCH_MOISTURE", "BATCH_TEMPERATURE", "BATCH_BATCH", "BATCH_BENTONITE", "BATCH_DUST", "BATCH_SAND", "BATCH_WATER"];
    //let batch_list = ["BATCH_MOISTURE, BATCH_TEMPERATURE, BATCH_BATCH, BATCH_BENTONITE, BATCH_DUST, BATCH_SAND, BATCH_WATER"];
    let data_list = new Array();

    // 기본값 매핑
    const defaultValues = [g_30, g_40, g_50, g_70, g_100, g_140, g_200, g_270, pan, afs_clay, afs_grain];

    for (var i = 0; i < 18; i++) {
        var inputValue = $('#' + input_list[i]).val();

        // 값이 없고 i가 11 미만일 경우 기본값 할당
        if (inputValue === "" && i < 11) {
            data_list[i] = defaultValues[i];
        }
        // 값이 없고 i가 11 이상일 경우 알림 후 종료
        else if (inputValue === "" && i >= 11) {
            alert("배치 데이터를 입력해 주세요!!");
            return false;
        }
        // 그 외의 경우에는 값 할당
        else {
            data_list[i] = parseFloat(inputValue);
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
        [1.8, 4.0353], //BATCH_Moisture
        [10.4053, 60.2604], //BATCH_TEMP
        [962.6015, 1150.152],
        [14.06, 21.31],
        [4.53, 13.15],
        [5.44, 13.15],
        [22.6481, 44.0828]
    ];

    function normalizeValue(value, index) {
        const [min, max] = normalizationBounds[index];
        return (value - min) / (max - min);
    }
    
    for (var i = 0; i < 18; i++) {
        data_list[i] = normalizeValue(data_list[i], i);
    }

    console.log("normal : ",data_list);

    let res_strength = BATCH_STRENGTH.predict(tf.tensor(data_list, [1,data_list.length])).arraySync();
    let res_compact = BATCH_COMPACT.predict(tf.tensor(data_list, [1,data_list.length])).arraySync();

    $("#BATCH_STRENGTH").text(parseFloat(res_strength).toFixed(2));
    $("#BATCH_COMPACT").text(parseFloat(res_compact).toFixed(2));

});


/*
for(var i=0; i<18; i++){
        if(i<11){
            if($('#'+input_list[i]).val() == "") {
                switch(i){
                    case 0:
                        data_list[i] = g_30;
                        break;
                    case 1:
                        data_list[i] = g_40;
                        break;
                    case 2:
                        data_list[i] = g_50;
                        break;
                    case 3:
                        data_list[i] = g_70;
                        break;
                    case 4:
                        data_list[i] = g_100;
                        break;
                    case 5:
                        data_list[i] = g_140;
                        break;
                    case 6:
                        data_list[i] = g_200;
                        break;
                    case 7:
                        data_list[i] = g_270;
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
                    default:
                        return false;
                }
            } else {
                data_list[i] = parseFloat($('#'+input_list[i]).val());
            }
        } else {
            if($('#'+input_list[i]).val() == ""){
                alert("배치 데이터를 입력해 주세요!!");
                return false;
            }
            data_list[i] = parseFloat($('#'+input_list[i]).val());
        }
    }
*/