export function exportImage() {
    const wrapper = document.getElementById('gameCanvasWrapper');

    // Lưu trạng thái ban đầu
    const originalStyle = {
        transform: wrapper.style.transform,
        overflow: wrapper.style.overflow,
        scale: wrapper.style.scale,
    };

    // Reset tạm thời các transform để chụp đủ
    wrapper.style.transform = 'none';
    wrapper.style.scale = '1';
    wrapper.style.overflow = 'visible';

    // Scroll to top just in case
    wrapper.scrollTop = 0;
    wrapper.scrollLeft = 0;

    html2canvas(wrapper, {
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        scale: 2 // chất lượng cao
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'snapshot.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Trả lại trạng thái cũ
        wrapper.style.transform = originalStyle.transform;
        wrapper.style.scale = originalStyle.scale;
        wrapper.style.overflow = originalStyle.overflow;
    }).catch(err => {
        console.error('Export failed:', err);

        // Trả lại trạng thái cũ nếu lỗi
        wrapper.style.transform = originalStyle.transform;
        wrapper.style.scale = originalStyle.scale;
        wrapper.style.overflow = originalStyle.overflow;
    });
}

export function exportToGIF() {
    const canvas = document.getElementById('gameCanvas');
    const backImage = document.getElementById('backImage');

    if (!backImage) {
        console.error('Không tìm thấy phần tử backImage');
        return;
    }

    // Lấy vị trí và kích thước của backImage
    const rect = backImage.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const totalFrames = parseInt((document.getElementById('gifFrames') || {}).value) || 5;
    const interval = parseInt((document.getElementById('captureDelay') || {}).value) || 250;
    const quality = parseInt((document.getElementById('gifQuality') || {}).value) || 20;
    const delayGif = parseInt((document.getElementById('gifDelay') || {}).value) || 250;



    const gif = new GIF({
        workers: 4,
        quality: quality,
        width: width,
        height: height,
        workerScript: './dist/gif.worker.js'
    });



    let frame = 0;

    const captureFrame = () => {
        requestAnimationFrame(() => {
            html2canvas(canvas, {
                useCORS: true,
                backgroundColor: null,
                scale: 1,
                width: width,
                height: height,
                scrollX: 0,
                scrollY: 0,
                x: (rect.x - canvasRect.x),
                y: 0
            }).then((capturedCanvas) => {
                gif.addFrame(capturedCanvas, { delay: delayGif });

                frame++;
                if (frame < totalFrames) {
                    setTimeout(captureFrame, interval);
                } else {
                    gif.on('finished', function(blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'gameScene.gif';
                        a.target = '_blank';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    });
                    gif.render();
                }
            }).catch(err => {
                console.error('Frame capture failed:', err);
            });
        });
    };


    captureFrame();
}