$(document).ready( function()  {
    var paper = Raphael("canvas", $('#canvas').width(), $(window).height() * 0.95)
    let canvasWidth;
    let canvasHeight;

    openTab();


    $('#sliderTab').click(() => {
        if ($('#slider').hasClass("open")) {
            closeTab();
        }
        else {
            openTab();
        }
    });

    $('#sliderBackground').click(() => {
        if ($('#slider').hasClass("open")) {
            closeTab();
        }
    });


    $('#generateButton').click(() => {
        
        
        let jsonContent;
        try{
            sequenceObject = JSON.parse($('#jsonInput').val());
        }catch(e) {
            alert("Error en el JSON");
            return;
        }

        closeTab();
        

        canvasWidth = sequenceObject.horizontal_space * sequenceObject.objects.length;
        canvasHeight = sequenceObject.messages.length * 40 + 200;
        
        paper.setSize(canvasWidth, canvasHeight);
        paper.clear();

        
        new TextBox(paper, 10, 10, sequenceObject.title, "Arial", 14, true, 10);

        let lines = {};
        for (let i = 0; i < sequenceObject.objects.length; i++) {
            let xRectangle = sequenceObject.horizontal_space * i + 50;
            let yRectangle = 80;

            let textBox = new TextBox(paper, xRectangle, yRectangle, sequenceObject.objects[i].name, "Arial", 14, true, 10);

            let xLine = xRectangle + textBox.width / 2;
            let yLine = yRectangle + textBox.height;
            let lineLength = sequenceObject.messages.length * 45;

            let line = new Line(paper, xLine, yLine, xLine, yLine + lineLength, false, "#202020", 1);
            lines[sequenceObject.objects[i].id] = line;
        }

        let n = 0;
        sequenceObject.messages.forEach(message => {
            let origin = message.origin;
            let destination = message.destination;

            let yLine = 150 + n * 40;
            let xOrigin = lines[origin].x1;
            let xDestination = lines[destination].x1;

            let xText;
            let yText;
            if (xOrigin < xDestination)
                xText = xOrigin;
            else
                xText = xDestination;
            
            xText = xText + 15;
            yText = yLine - 15;

            if (origin !== destination) {
                if (message.type === "message")
                    new ArrowLine(paper, xOrigin, yLine, xDestination, yLine, false, "black", 1);
                else if (message.type === "reply")
                    new ArrowLine(paper, xOrigin, yLine, xDestination, yLine, true, "black", 1);

                new SimpleText(paper, xText, yText, message.text, "Arial", 11);
            }
            else {
                new Line(paper, xOrigin, yLine, xOrigin - 25, yLine, false, "black", 1);
                new Line(paper, xOrigin - 25, yLine, xOrigin - 25, yLine + 25, false, "black", 1);
                new ArrowLine(paper, xOrigin - 25, yLine + 25, xOrigin, yLine + 25, false, "black", 1);


                let textSize = getTextSize(paper, message.text, "Arial", 12);
                xText = xText - 30 - textSize.width;
                yText = yLine - 15;

                let text1 = new SimpleText(paper, xText, yText, message.text, "Arial", 11);
            }

            n ++;
        });
    });

    $("#downloadButton").click(() => {
        let hiddenElement = document.createElement('a');
        let svg = paper.toSVG();

        
        let canvasElement = document.createElement('canvas');
        canvasElement.width = canvasWidth;
        canvasElement.height = canvasHeight;
        let canvasContext = canvasElement.getContext("2d");

        // Para cargar el canvas con el SVG gnerado, primero se dbe crear un
        // Image
        let DOMURL = window.URL || window.webkitURL || window;
        let imageAux = new Image();
        let svgBlob = new Blob([svg], {type: 'image/svg+xml'});
        let url = DOMURL.createObjectURL(svgBlob);

        imageAux.onload = function() {
            // Se dibuja el Image creado en el canvas
            canvasContext.drawImage(imageAux, 0, 0);

            // Se le pone un fondo blanco (atrás de lo que se acaba de dibujar)
            canvasContext.globalCompositeOperation = 'destination-over'
            canvasContext.fillStyle = "#ffffff";
            canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);

            // Se libera la URL creada para el objecto con el SVG
            DOMURL.revokeObjectURL(url);

            // Convertir de SVG a PNG usando canvas de HTML
            hiddenElement.href = canvasElement.toDataURL("image/png;base64");;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'diagram.png';
            hiddenElement.click();
         };
         imageAux.src = url;   
        
    })


    function openTab () {
        $('#sliderFormContainer').animate({
            'margin-left': '0px'
        },400);
        
        $('#sliderTab').animate({
            'margin-left': `${$('#sliderFormContainer').width()}px`,
            'border-top-left-radius': '0px',
            'border-bottom-left-radius': '0px'
        },400);

        $('#sliderBackground').animate({
            'opacity': 0.9
        },200);
    
        $('#slider').addClass("open")
    }

    function closeTab () {
        $('#sliderFormContainer').animate({
            'margin-left':`-${$('#sliderFormContainer').width()}px`
        }, 1000, "easeOutBounce");

        $('#sliderTab').animate({
            'margin-left': `0px`,
            'border-top-left-radius': '20px',
            'border-bottom-left-radius': '20px'
        }, 1000, "easeOutBounce");

        $('#sliderBackground').animate({
            'opacity': 0
        },200);

        $('#slider').removeClass("open")
    }
});






function getTextSize (paperObject, text, font = "Arial", size = 12) {
    if (paperObject) {
        let text1 = paperObject.text(0, 0, text);
        text1.attr({
            'font-family': font,
            'font-size': size
        });

        let textWidth = text1.getBBox().width;
        let textHeight = text1.getBBox().height;

        text1.remove();

        return {width: textWidth, height: textHeight};
    }
    
}

class SimpleText {

    constructor(paperObject, x, y, text, font = "Arial", size = 12) {
        if (paperObject) {
            let textBoxText = paperObject.text(x, y, text);
            textBoxText.attr ({
                'font-family': font,
                'font-size': size
            });
            textBoxText.translate(textBoxText.getBBox().width/2, textBoxText.getBBox().height/2);
            let textHeight = textBoxText.getBBox().height;
            let textWidth = textBoxText.getBBox().width;

            this.width = textWidth;
            this.height = textHeight;
        }
    }
}

class TextBox {

    constructor(paperObject, x, y, text, font = "Arial", size = 12, border = true, margin = 10) {
        if (paperObject) {
            let textBoxText = paperObject.text(x + margin, y + margin, text);
            textBoxText.attr ({
                'font-family': font,
                'font-size': size
            });
            textBoxText.translate(textBoxText.getBBox().width/2, textBoxText.getBBox().height/2);
            let textHeight = textBoxText.getBBox().height;
            let textWidth = textBoxText.getBBox().width;

            this.width = textWidth + margin * 2;
            this.height = textHeight+ margin * 2;

            if (border) {
                let borderObject = paperObject.rect(x, y, textWidth + margin*2, textHeight + margin*2);
                borderObject.attr({
                    fill: "none",
                    stroke:"black",
                    'stroke-width': 2
                });
            }

            
        }
    }

}


class Line {
    constructor (paperObject, x1, y1, x2, y2, dashed = false, color = "black", width = 1) {
        if (paperObject) {
            if (dashed) {
                let line1 = paperObject.path(`M${x1},${y1} L${x2},${y2}`);
                line1.attr({
                    stroke: color,
                    'stroke-width': width,
                    "stroke-dasharray":"-"
                });
            }
            else {
                let line1 = paperObject.path(`M${x1},${y1} L${x2},${y2}`);
                line1.attr({
                    stroke: color,
                    'stroke-width': width
                });
            }

            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
        }
    }
}


class ArrowLine {
    constructor (paperObject, x1, y1, x2, y2, dashed = false, color = "black", width = 1) {
        if (paperObject) {
            let line1 = new Line (paperObject, x1, y1, x2, y2, dashed, color, width);

            let theta = 30 * Math.PI / 180
            let l_head = 10
            let l1 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

            let x3 = x2 + l_head / l1 * ( (x1 - x2) * Math.cos(theta) + (y1 - y2) * Math.sin(theta) )
            let y3 = y2 + l_head / l1 * ( (y1 - y2) * Math.cos(theta) - (x1 - x2) * Math.sin(theta) )

            let x4 = x2 + l_head / l1 * ((x1 - x2) * Math.cos(theta) - (y1 - y2) * Math.sin(theta))
            let y4 = y2 + l_head / l1 * ((y1 - y2) * Math.cos(theta) + (x1 - x2) * Math.sin(theta))
            
            let line2 = new Line (paperObject, x2, y2, x3, y3, false, color, width);
            let line3 = new Line (paperObject, x2, y2, x4, y4, false, color, width);
        }
    }
}