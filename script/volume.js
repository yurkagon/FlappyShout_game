var volume;

navigator.mediaDevices.getUserMedia({
	audio: true,
  })
	.then(function(stream) {
	  const audioContext = new AudioContext();
	  const analyser = audioContext.createAnalyser();
	  const microphone = audioContext.createMediaStreamSource(stream);
	  
	  const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
	  analyser.fftSize = 2048;
	  analyser.smoothingTimeConstant = 0.6;

  
	  microphone.connect(analyser);
	  analyser.connect(scriptProcessor);
	  scriptProcessor.connect(audioContext.destination);

	  scriptProcessor.onaudioprocess = function() {
		const array = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(array);
		const arraySum = array.reduce((a, value) => a + value, 0);

		volume = (arraySum / array.length);

		console.log(volume)
	  };
	})
	.catch(function(err) {
	  console.error(err);
	});
