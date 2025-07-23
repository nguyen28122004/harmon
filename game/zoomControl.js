const scaleSlider = document.getElementById('scaleSlider');
const scaleValue = document.getElementById('scaleValue');
const gameCanvas = document.getElementById('gameCanvas');

export function initZoomControl() {
    scaleSlider.addEventListener('input', () => updateScale(parseFloat(scaleSlider.value)));
    updateScale(parseFloat(scaleSlider.value));
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            let scale = parseFloat(scaleSlider.value);
            const delta = e.deltaY < 0 ? 0.1 : -0.1;
            scale = Math.min(3, Math.max(0.1, scale + delta));
            scaleSlider.value = scale.toFixed(1);
            updateScale(scale);
        }
    }, { passive: false });
}

function updateScale(scale) {
    const translateX = (1 - scale) * gameCanvas.offsetWidth / 2;
    const translateY = (1 - scale) * gameCanvas.offsetHeight / 2;
    gameCanvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    scaleValue.textContent = scale.toFixed(1);
}