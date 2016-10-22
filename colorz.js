function Colorz() {

    var colorPalette = [
        "#00ffff", "#f0ffff", "#f5f5dc", "#0000ff",
        "#a52a2a", "#00ffff", "#008b8b", "#a9a9a9",
        "#006400", "#bdb76b", "#8b008b", "#556b2f",
        "#ff8c00", "#9932cc", "#e9967a", "#9400d3",
        "#ff00ff", "#ffd700", "#008000", "#f0e68c",
        "#add8e6", "#e0ffff", "#90ee90", "#d3d3d3", 
        "#ffb6c1", "#ffffe0", "#00ff00", "#ff00ff",
        "#808000", "#ffa500", "#ffc0cb", "#800080", 
        "#ff0000", "#c0c0c0", "#f1f1f1", "#ffff00"
    ];

    var colorCounter = 0;

    return {
        getColor: function() {
            return colorPalette[colorCounter = ++colorCounter % colorPalette.length];
        }
    }
}

module.exports = new Colorz();