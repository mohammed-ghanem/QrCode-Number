const form = document.getElementById('generate-form')
const qr = document.getElementById('qrcode')

const onGenerateSubmit = (e) => {
  e.preventDefault()
  clearUI();

  const url = document.getElementById('url').value
  const size = document.getElementById('size').value


  if (url === '') {
    alert('please enter the url')
  } else {
    showSpinner()
    setTimeout(() => {
      hideSpinner();
      generateQRcode(url , size);

      setTimeout(() => {
        const saveUrlBtn = qr.querySelector('img').src;
        createSaveBtn(saveUrlBtn);
      }, 50);
    }, 1000)
  }
}

const generateQRcode = (url , size) => {
    const qrcode = new QRCode('qrcode', {
        text : url ,
        width : size , 
        height : size,
    })
}

const showSpinner = () => {
  document.getElementById('spinner').style.display ='block'
}
const hideSpinner = () => {
  document.getElementById('spinner').style.display = 'none'
}
const clearUI = ()=> {
    qr.innerHTML  = '';
    const saveLink = document.getElementById('save-link');
    if (saveLink)
    saveLink.remove();
   
}

const createSaveBtn = (saveUrl) => {
  const srcImg = document.querySelector("#qrcode img");
  
  // console.log(srcImg.getAttribute("src"))
  const link = document.createElement('a');
  link.id = 'save-link';
  link.classList = "saveQrCodeImg btn btn-sm btn-danger fw-bold";
  link.href = saveUrl;
  link.download = srcImg.getAttribute("src");
  link.innerHTML = 'Download QR Code';
  document.getElementById("Generated").appendChild(link); 
} 

hideSpinner();

form.addEventListener('submit', onGenerateSubmit)
