$(document).ready(function() {
    new WOW().init();
    $('[data-toggle="tooltip"]').tooltip();
    
    // Mostrar tooltip do WhatsApp após 3 segundos
    setTimeout(function() {
        $('.whatsapp-fixed').tooltip('show');
    }, 3000);
    
    let downloadSpeed = 0;
    let uploadSpeed = 0;
    let userIP = 'Carregando...';
    
    // Get user IP on load
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            userIP = data.ip;
            $('#userIP').text(userIP);
        })
        .catch(err => {
            console.error('Erro ao obter IP:', err);
            $('#userIP').text('Erro');
        });
    
    $('#startTest').click(function() {
        startSpeedTest();
    });
    
    $('#restartTest').click(function() {
        $('#results').hide();
        $('#progress').hide();
        $('#startSection').show();
    });
    
    function startSpeedTest() {
        $('#startSection').hide();
        $('#progress').show();
        $('#results').hide();
        
        // Simular progresso
        let progress = 0;
        let interval = setInterval(function() {
            progress += 5;
            $('#progressBar').css('width', progress + '%');
            if (progress >= 100) {
                clearInterval(interval);
                completeTest();
            }
        }, 300);
        
                // Teste de download
                const testFile = '/api/download';
                const startTime = Date.now();
                const numConcurrent = 4;
                const promises = [];
                for (let i = 0; i < numConcurrent; i++) {
                    promises.push(fetch(testFile).then(response => response.blob()));
                }
                Promise.all(promises).then(blobs => {
                    const totalBytes = blobs.reduce((sum, blob) => sum + blob.size, 0);
                    const endTime = Date.now();
                    const duration = (endTime - startTime) / 1000; // segundos
                    const bits = totalBytes * 8;
                    downloadSpeed = (bits / duration / 1000000).toFixed(2); // Mbps
                }).catch(err => {
                    console.error('Erro no teste de download:', err);
                    downloadSpeed = 'Erro';
                });
                
                // Teste de upload
                const uploadBlob = new Blob([new ArrayBuffer(10485760)], {type: 'application/octet-stream'}); // 10MB
                const uploadStart = Date.now();
                fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'x-start-time': uploadStart.toString()
                    },
                    body: uploadBlob
                }).then(response => response.json()).then(data => {
                    uploadSpeed = data.speed;
                }).catch(err => {
                    console.error('Erro no teste de upload:', err);
                    uploadSpeed = 'Erro';
                });
    }
    
    function completeTest() {
        setTimeout(() => {
            $('#progress').hide();
            $('#results').show();
            $('#downloadSpeed').text(downloadSpeed + ' Mbps');
            $('#uploadSpeed').text(uploadSpeed + ' Mbps');
            // IP is already updated
        }, 500);
    }
});