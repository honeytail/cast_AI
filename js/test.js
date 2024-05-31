$(document).ready(function(){
    let Model_Type = "Type_A";

    $('ul.tabs li').click(function(){
        var tab_id = $(this).attr('data-tab');

        $('ul.tabs li').removeClass('current');
        $('.tab-content').removeClass('current');

        $(this).addClass('current');
        $("#" + tab_id).addClass('current');

        Model_Type = tab_id;
    });

    const normalizationBounds = [
        [0.1, 0.5], [0.9, 3.3], [4.3, 10.7], [16.7, 20.9], [9.5, 16.7], [1.1, 2.8], [0.2, 0.9], [0.1, 0.4], 
        [0.09, 0.29], [10.68, 16.26], [53.5524, 63.1717], [3, 4], [10, 45], [962.6015, 1150.152], [15, 20], 
        [3.5, 5], [5, 13], [14, 20]
    ];

    const denormalizationBounds = [
        [15, 20], [3.5, 5], [5, 13], [14, 20], [900, 1150]
    ];

    async function loadModels() {
        const models = {
            BATCH_STRENGTH_A: await tf.loadLayersModel("model/tfjs_cs_A/model.json"),
            BATCH_COMPACT_A: await tf.loadLayersModel("model/tfjs_comp_A/model.json"),
            BATCH_STRENGTH_B: await tf.loadLayersModel("model/tfjs_cs_B/model.json"),
            BATCH_COMPACT_B: await tf.loadLayersModel("model/tfjs_comp_B/model.json")
        };
        return models;
    }

    function normalizeValue(value, index) {
        const [min, max] = normalizationBounds[index];
        return (value - min) / (max - min);
    }

    function denormalizeValue(normalizedValue, index) {
        const [min, max] = denormalizationBounds[index];
        return normalizedValue * (max - min) + min;
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function predictAndDisplayResults(models) {
        $('#table_data > tbody > tr').remove();
        let index = 1;

        let strength = parseFloat($("#Compression_Strength").val());
        let compactability = parseFloat($("#Compactability").val());

        if (isNaN(strength) || isNaN(compactability)) {
            alert("Please enter the desired values.");
            return;
        }

        const input_list = ["GFD_30", "GFD_40", "GFD_50", "GFD_70", "GFD_100", "GFD_140", "GFD_200", "GFD_270", "Pan", "AFS_Clay_Content", "AFS_Grain_Fineness_No", "BATCH_MOISTURE", "BATCH_TEMPERATURE", "BATCH_BATCH", "BATCH_BENTONITE", "BATCH_DUST", "BATCH_SAND", "BATCH_WATER"];
        const default_values = [0.1, 1.5, 7.5, 20.1, 11.6, 1.8, 0.5, 0.3, 0.17, 13.12, 57.6542, 1, 31.9476, 0, 0, 0, 0, 0];

        let data_list = input_list.map((input, i) => {
            let value = parseFloat($("#" + input).val());
            return isNaN(value) ? default_values[i] : value;
        });

        data_list = data_list.map((value, i) => normalizeValue(value, i));

        const modelKeyPrefix = Model_Type === "Type_A" ? "A" : "B";
        const BATCH_STRENGTH = models[`BATCH_STRENGTH_${modelKeyPrefix}`];
        const BATCH_COMPACT = models[`BATCH_COMPACT_${modelKeyPrefix}`];

        let results = [];
        const progress_overlay = $("#progress_overlay");
        const progress_bar_fill = $("#progress_bar_fill");
        const progress_text = $("#progress_text");

        progress_overlay.css("display", "flex");  // 애니메이션 시작 시 보이도록 설정

        for (let j = 0; j < 1000; j++) {
            let rand_list = Array.from({length: 6}, () => Math.random().toFixed(4));

            data_list[11] = rand_list[0];
            data_list[13] = rand_list[1];
            data_list[14] = rand_list[2];
            data_list[15] = rand_list[3];
            data_list[16] = rand_list[4];
            data_list[17] = rand_list[5];

            let res_strength = BATCH_STRENGTH.predict(tf.tensor([data_list])).arraySync()[0];
            let res_compact = BATCH_COMPACT.predict(tf.tensor([data_list])).arraySync()[0];

            if (res_strength >= strength * 0.9 && res_strength <= strength * 1.1 &&
                res_compact >= compactability * 0.9 && res_compact <= compactability * 1.1) {

                let cs_point = (data_list[14] * 0.4) + (data_list[16] * 0.3) + (data_list[17] * 0.2) - (data_list[15] * 0.1);
                let comp_point = -(data_list[15] * 0.4) + (data_list[16] * 0.3) + (data_list[14] * 0.2) - (data_list[17] * 0.1);
                let total_point = cs_point + comp_point;

                results.push({
                    total_point,
                    cs_point,
                    data: [...rand_list, res_strength, res_compact]
                });
            }

            let progress = ((j + 1) / 1000) * 100;
            progress_bar_fill.css("width", progress + "%");
            progress_text.text(Math.floor(progress) + "%");

            await delay(0.5);  // Add a small delay to make the animation visible
        }

        progress_overlay.css("display", "none");  // 애니메이션 종료 시 숨김

        if (results.length === 0) {
            alert("No matching results found!");
            return;
        }

        results.sort((a, b) => b.total_point - a.total_point || b.cs_point - a.cs_point);
        results.slice(0, 10).forEach((result, idx) => {
            let [batch_bentonite, batch_dust, batch_sand, batch_water, batch_batch, pre_str, pre_com] = result.data;
            let output_list = [batch_bentonite, batch_dust, batch_sand, batch_water, batch_batch].map(denormalizeValue);

            let table_data = `
                <tr id=table_list${index}>
                    <td>${index}</td>
                    <td>${output_list[0].toFixed(4)}</td>
                    <td>${output_list[1].toFixed(4)}</td>
                    <td>${output_list[2].toFixed(4)}</td>
                    <td>${output_list[3].toFixed(4)}</td>
                    <td>${output_list[4].toFixed(4)}</td>
                    <td>${parseFloat(pre_str).toFixed(4)}</td>
                    <td>${parseFloat(pre_com).toFixed(4)}</td>
                </tr>`;

            index++;
            $("#table_data > tbody").append(table_data);
        });

        //alert("Search complete");
    }

    let models;

    loadModels().then(loadedModels => {
        models = loadedModels;

        $('#search_btn').click(function() {
            predictAndDisplayResults(models);
        });
    }).catch(error => {
        console.error("Error loading models:", error);
    });
});
