/*volume meteer lib
https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
*/
function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
	var processor = audioContext.createScriptProcessor(512);
	processor.onaudioprocess = volumeAudioProcess;
	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 0;
	processor.clipLevel = clipLevel || 0.98;
	processor.averaging = averaging || 0.95;
	processor.clipLag = clipLag || 750;

	// this will have no effect, since we don't copy the input to the output,
	// but works around a current Chrome bug.
	processor.connect(audioContext.destination);

	processor.checkClipping =
		function(){
			if (!this.clipping)
				return false;
			if ((this.lastClip + this.clipLag) < window.performance.now())
				this.clipping = false;
			return this.clipping;
		};

	processor.shutdown =
		function(){
			this.disconnect();
			this.onaudioprocess = null;
		};

	return processor;
}

function volumeAudioProcess( event ) {
	var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
	var sum = 0;
    var x;

	// Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
    	x = buf[i];
    	if (Math.abs(x)>=this.clipLevel) {
    		this.clipping = true;
    		this.lastClip = window.performance.now();
    	}
    	sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
}

////////


var volume = 0;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

var context = new AudioContext();
var volumeChecker = createAudioMeter(context);
var analyser = context.createAnalyser();
var gain = context.createGain();
gain.gain.value = 0;
analyser.fftSize = 2048;
var frequencyData = new Float32Array(analyser.frequencyBinCount);
analyser.connect(volumeChecker);
gain.connect(context.destination);
var analyzerSamples = analyser.frequencyBinCount;

window.addEventListener("load", function() {
    navigator.getUserMedia({audio: true, video: false}, function(stream) {
        var mic = context.createMediaStreamSource(stream);
        mic.connect(analyser);
    }, function(err) { throw new Error(err.name) });
});

//checking volume
setInterval(() => {
    analyser.getFloatFrequencyData(frequencyData);

   
    volume = volumeChecker.volume * 100;

    //document.getElementById("out").innerHTML = volume;


    function limiter(value,min,max){
    	if(value <= min ) return min;
    	if(value >= max ) return max;
    	return value;
    }
},10);