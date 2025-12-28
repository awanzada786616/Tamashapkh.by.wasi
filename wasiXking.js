const OTP_API_URL = "https://damp-resonance-12e3.ilyasbhai869.workers.dev/";
const ACTIVATE_API_URL = "https://royal-voice-9675.ilyasbhai869.workers.dev/";

const msisdnInput = document.getElementById('msisdn');
const otpInput = document.getElementById('otp');
const getOtpBtn = document.getElementById('getOtpBtn');
const activate1Btn = document.getElementById('activate1Btn');
const activate3Btn = document.getElementById('activate3Btn');
const activate7Btn = document.getElementById('activate7Btn');
const activate30Btn = document.getElementById('activate30Btn');
const otpStatus = document.getElementById('otpStatus');
const responseBlock = document.getElementById('responseBlock');
const responseMsg = document.getElementById('responseMsg');
const loader = document.getElementById('loader');

let resendSeconds = 30;
let resendTimer = null;

// Live formatting for 3 number types
msisdnInput.addEventListener('input', ()=>{
  let val = msisdnInput.value.replace(/\D/g,'');
  if(val.startsWith('92') && val.length>=10) val='+'+val;
  else if(val.startsWith('3')) val='+92'+val;
  else if(val.startsWith('0')) val='+92'+val.slice(1);
  msisdnInput.value = val;
});

function showResponse(ok,msg){
  responseBlock.style.display='block';
  responseMsg.className = ok ? 'success' : 'error';
  responseMsg.innerHTML = msg;
  loader.style.display='none';
}

function clearResponse(){ responseBlock.style.display='none'; responseMsg.innerHTML=''; }

function showLoader(el,text="Working..."){ el.innerHTML = '<span class="loader"></span> ' + text; loader.style.display='block'; }

// OTP
getOtpBtn.addEventListener('click', async ()=>{
  clearResponse();
  const num=msisdnInput.value;
  if(!/^\+923\d{9}$/.test(num)) return showResponse(false,'Invalid number format');
  showLoader(otpStatus,'Sending OTP...');
  getOtpBtn.disabled=true;
  try{
    await fetch(OTP_API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({number:num})});
    showResponse(true,'✅ OTP sent to '+num);
    startResendTimer();
  }catch(e){showResponse(false,'❌ OTP request failed');}
  otpStatus.innerHTML='';
});

function startResendTimer(){
  resendSeconds = 30;
  getOtpBtn.disabled = true;
  getOtpBtn.innerText = `Resend OTP (${resendSeconds}s)`;
  resendTimer = setInterval(()=>{
    resendSeconds--;
    getOtpBtn.innerText = `Resend OTP (${resendSeconds}s)`;
    if(resendSeconds<=0){
      clearInterval(resendTimer);
      getOtpBtn.innerText = "Get OTP";
      getOtpBtn.disabled = false;
    }
  },1000);
}

// Activate
async function activate(pid){
  clearResponse();
  const msisdn=msisdnInput.value;
  const otp=otpInput.value.trim();
  if(!/^\+923\d{9}$/.test(msisdn)) return showResponse(false,'Enter valid number');
  if(!otp) return showResponse(false,'Enter OTP');
  showLoader(responseMsg,'Activating...');
  responseBlock.style.display='block';
  try{
    const payload={msisdn,otp,package_id:pid};
    const r=await fetch(ACTIVATE_API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await r.json().catch(()=>({text:r.statusText}));
    const ok=(data.code===0||/success/i.test(JSON.stringify(data)));
    if(data.message && data.message.toLowerCase().includes("already")){
      showResponse(true,"🥰 Already active package");
    } else {
      showResponse(ok,ok?'✅ Package Activated Successfully':'❌ Activation Failed');
    }
  }catch(e){showResponse(false,'⚠️ Network error');}
  loader.style.display='none';
}

activate1Btn.onclick=()=>activate(1);
activate3Btn.onclick=()=>activate(4);
activate7Btn.onclick=()=>activate(2);
activate30Btn.onclick=()=>activate(3);
    
