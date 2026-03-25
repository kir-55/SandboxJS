



function exportToFile() {
	const data = {
		width: width,
		height: height,
		screen: screen,
	};

	const json = JSON.stringify(data);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = "sandbox.sx";
	a.click();

	URL.revokeObjectURL(url);
}

function importFromFile() {
	const input = document.getElementById("fileInput");
	input.click();

	input.onchange = () => {
		const file = input.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = JSON.parse(e.target.result);

				// Basic validation
				if (!data.screen || !Array.isArray(data.screen)) {
					alert("Invalid file");
					return;
				}

				stop();

				screen = data.screen;

				start();
			} catch (err) {
				alert("Failed to load file");
				console.error(err);
			}
		};
		reader.readAsText(file);
	};
}

 async function saveToDatabase() {
        const worldName = worldNameInput.value.trim();
            if (!worldName) {
                saveMessage.textContent = 'Please enter a world name.';
                saveMessage.style.color = '#ff6b6b';
                return;
            }

            const payload = {
                world_name: worldName,
                screen_data: screen,    // global 2D array from simulation
                width: width,
                height: height
            };

            try {
                const response = await fetch('/api/saves', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                worldNameInput.value = worldName;

				window.location.href = '/simulation?load=' + worldName;

            } catch (err) {
                console.error(err);
                saveMessage.textContent = 'Network error';
                saveMessage.style.color = '#ff6b6b';
            }
    }