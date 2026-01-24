import { Filmovi, layout } from "./Filmovi.js"; // Pretpostavljam da je ovo AdminMain.js preimenovan
import { Home } from "./Home.js";
import { DrawBioskopiPage } from "./Bioskopi.js"; // OVO NAM TREBA ZA KORISNIKA
import { DrawAdminHeader } from "./Navigation.js";

const host = document.getElementById("app");
let page = 0;
let max_page = 0;

// --- 1. POKRETANJE (LOGIN EKRAN) ---
// Prvo čekamo da se učita DOM, za svaki slučaj
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("app")) {
        initApp();
    }
});

export function initApp() {
    host.innerHTML = "";
    
    // Callback funkcija koju Home.js poziva kad je login uspešan
    const onLoginSuccess = (role) => {
        console.log("Ulogovan kao:", role);

        if (role === "Admin") {
            // ADMIN -> Ide na listu filmova sa opcijama za editovanje
            DrawBioskopiPage(true);
        } else {
            // KORISNIK -> Ide na listu bioskopa
            // false znači: "Nije admin, sakrij dugmiće za brisanje i prikaži rezervaciju"
            DrawBioskopiPage(false); 
        }
    };

    const homePage = new Home(host, onLoginSuccess);
    homePage.DrawHomePage();
}

// --- 2. ADMIN STRANICA (LISTA FILMOVA) ---
export async function DrawAdminPage() {
    host.innerHTML = "";
    
    // Crtamo header (navigaciju)
    DrawAdminHeader(host, "filmovi");

    const contentWrapper = document.createElement("div");
    contentWrapper.style.paddingTop = "20px";
    contentWrapper.style.textAlign = "center";
    host.appendChild(contentWrapper);

    // Dugme + DODAJ NOVI FILM
    const btnAdd = document.createElement("button");
    btnAdd.innerText = "+ DODAJ NOVI FILM";
    btnAdd.classList.add("button"); 
    btnAdd.style.marginBottom = "30px";
    btnAdd.style.fontSize = "1.1rem";
    btnAdd.onclick = () => { DrawInsertPage(); };
    contentWrapper.appendChild(btnAdd);

    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("CardRow");
    contentWrapper.appendChild(cardsContainer);

    try {
        // Fetch podataka
        const responseCount = await fetch(`https://localhost:7172/api/Film/Brojfilmova`, { cache: "no-store" });
        if (!responseCount.ok) throw new Error("Greška kod brojanja");
        const totalFilms = await responseCount.json();
        
        max_page = Math.ceil(totalFilms / 12);
        if (max_page === 0) max_page = 1;

        const responseList = await fetch(`https://localhost:7172/api/Film/ListaFilmova/${page}`, { cache: "no-store" });
        if (!responseList.ok) throw new Error("Greška kod liste");
        const data = await responseList.json();

        if (data.length === 0) {
            cardsContainer.innerHTML = "<h3 style='color:white'>Nema filmova.</h3>";
        } else {
            for (let d of data) {
                // Koristimo AdminFilm klasu (koja se ovde zove Filmovi)
                let film = new Filmovi(cardsContainer, d.id, d.naziv, d.zanr, d.reziser, d.dugiOpis, d.opis, d.slika, d.glumci);
                film.Kartica();
            }
        }

        // Paginacija
        const pagDiv = document.createElement("div");
        pagDiv.style.padding = "40px";
        pagDiv.style.display = "flex";
        pagDiv.style.justifyContent = "center";
        pagDiv.style.gap = "20px";
        contentWrapper.appendChild(pagDiv);

        const prev_btn = document.createElement("button");
        prev_btn.innerText = "◄ PRETHODNA";
        prev_btn.classList.add("button");
        if (page <= 0) {
            prev_btn.disabled = true;
            prev_btn.style.opacity = "0.5";
            prev_btn.style.cursor = "default";
        } else {
            prev_btn.onclick = () => { page--; DrawAdminPage(); };
        }
        pagDiv.appendChild(prev_btn);

        const infoSpan = document.createElement("span");
        infoSpan.innerText = `${page + 1} / ${max_page}`;
        infoSpan.style.color = "#39ff14";
        infoSpan.style.fontWeight = "bold";
        infoSpan.style.fontSize = "1.2rem";
        infoSpan.style.alignSelf = "center";
        pagDiv.appendChild(infoSpan);

        const next_btn = document.createElement("button");
        next_btn.innerText = "SLEDEĆA ►";
        next_btn.classList.add("button");
        if (page >= max_page - 1) {
            next_btn.disabled = true;
            next_btn.style.opacity = "0.5";
            next_btn.style.cursor = "default";
        } else {
            next_btn.onclick = () => { page++; DrawAdminPage(); };
        }
        pagDiv.appendChild(next_btn);

    } catch (error) {
        console.error(error);
        cardsContainer.innerHTML = "<h3 style='color:red'>Greška: Server nedostupan.</h3>";
    }
}

// --- 3. FORMA ZA UNOS / IZMENU ---
export function DrawInsertPage(fid = "", naziv = "", zanr = "", opis = "", dugiOpis = "", reziser = "", slika = "", glumci = [], edit = false){
    host.innerHTML = "";
    layout(host); 
    
    const mainContainer = document.createElement("div");
    mainContainer.classList.add("Container"); 
    host.appendChild(mainContainer);

    const naslov = document.createElement("h2");
    naslov.innerText = edit ? "IZMENI FILM" : "DODAJ NOVI FILM";
    mainContainer.appendChild(naslov);

    let imenaInputs = [];
    let ulogeInputs = [];
    let tipUlogeInputs = [];
    const containerGlumci = document.createElement("div");

    const formDiv = document.createElement("div"); 
    mainContainer.appendChild(formDiv);
    
    const createInputRow = (labelText, value, type="text") => {
        const row = document.createElement("div");
        row.classList.add("Row");
        const label = document.createElement("div");
        label.innerText = labelText;
        label.style.fontWeight = "bold";
        label.style.color = "#39ff14";
        label.style.minWidth = "120px";
        row.appendChild(label);        

        let input;
        if(labelText.includes("opis") || labelText.includes("Opis")) {
             input = document.createElement("textarea");
             input.rows = 3;
        } else {
             input = document.createElement("input");
             input.type = type;
        }
        input.classList.add("input");
        input.value = value;
        row.appendChild(input);
        formDiv.appendChild(row);
        return input;
    }

    const naziv_box = createInputRow("Naziv:", naziv);
    const zanr_box = createInputRow("Žanr:", zanr);
    const reziser_box = createInputRow("Režiser:", reziser);
    const opis_box = createInputRow("Kratak opis:", opis);
    const dugiOpis_box = createInputRow("Dugi opis:", dugiOpis);

    // Slika
    const slika_row = document.createElement("div");
    slika_row.classList.add("Row");
    formDiv.appendChild(slika_row);

    const slika_label = document.createElement("div");
    slika_label.innerText = "Slika:";
    slika_label.style.fontWeight = "bold";
    slika_label.style.color = "#39ff14";
    slika_label.style.minWidth = "120px";
    slika_row.appendChild(slika_label);  

    const slika_box = document.createElement("input");
    slika_box.type = "file";
    slika_box.classList.add("input");
    slika_box.accept = "image/*";
    slika_row.appendChild(slika_box);

    const imgPreview = document.createElement("img");
    imgPreview.src = slika ? "images/" + slika : "";
    imgPreview.style.maxWidth = "100px";
    imgPreview.style.display = "block";
    imgPreview.style.marginLeft = "135px";
    imgPreview.style.marginBottom = "20px";
    formDiv.appendChild(imgPreview);
    
    slika_box.onchange = () =>{
        const file = slika_box.files[0]; 
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { imgPreview.src = e.target.result; };
            reader.readAsDataURL(file); 
        }
    }

    // Glumci
    const glumciHeader = document.createElement("h3");
    glumciHeader.innerText = "GLUMCI";
    glumciHeader.style.color = "#39ff14";
    glumciHeader.style.marginTop = "20px";
    glumciHeader.style.borderBottom = "1px solid #333";
    formDiv.appendChild(glumciHeader);

    const btnAddActor = document.createElement("button");
    btnAddActor.innerText = "+ DODAJ GLUMCA";
    btnAddActor.classList.add("button");
    btnAddActor.style.fontSize = "0.8rem";
    btnAddActor.style.marginBottom = "15px";
    btnAddActor.style.marginTop = "10px";
    btnAddActor.onclick = () => { 
        imenaInputs.push(document.createElement("input"));
        ulogeInputs.push(document.createElement("input"));
        tipUlogeInputs.push(document.createElement("input"));
        RefreshGlumciUI(containerGlumci, imenaInputs, ulogeInputs, tipUlogeInputs);
    };
    formDiv.appendChild(btnAddActor);
    formDiv.appendChild(containerGlumci);

    if (edit && glumci){
        for (let glumac of glumci){
            const i = document.createElement("input"); i.value = glumac.ime;
            const u = document.createElement("input"); u.value = glumac.uloga;
            const t = document.createElement("input"); t.value = glumac.tipUloge;
            imenaInputs.push(i); ulogeInputs.push(u); tipUlogeInputs.push(t);
        }
        RefreshGlumciUI(containerGlumci, imenaInputs, ulogeInputs, tipUlogeInputs);
    }

    const sub = document.createElement("button"); 
    sub.innerText = edit ? "SAČUVAJ IZMENE" : "KREIRAJ FILM";
    sub.classList.add("button");
    sub.style.marginTop = "30px";
    sub.style.width = "100%";
    sub.style.backgroundColor = "#39ff14"; 
    sub.style.color = "black";
    
    sub.onclick = () => {
        if(naziv_box.value.trim() === "") { alert("Morate uneti naziv filma!"); return; }

        let listaGlumaca = [];
        for (let i = 0; i < imenaInputs.length; i++){
            if(imenaInputs[i].value.trim() !== "") { 
                const obj = { Ime : imenaInputs[i].value, Uloga : ulogeInputs[i].value, TipUloge : tipUlogeInputs[i].value }
                listaGlumaca.push(obj);
            }
        }
        if (!edit){
            postaviFilm(naziv_box.value, zanr_box.value, opis_box.value, dugiOpis_box.value, reziser_box.value, listaGlumaca, slika_box);
        } else {
            izmeniFilm(fid, naziv_box.value, zanr_box.value, opis_box.value, dugiOpis_box.value, reziser_box.value, listaGlumaca, slika_box);
        }
    };
    formDiv.appendChild(sub);

    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "ODUSTANI";
    cancelBtn.classList.add("button");
    cancelBtn.style.marginTop = "10px";
    cancelBtn.style.width = "100%";
    cancelBtn.style.borderColor = "#555";
    cancelBtn.style.color = "#aaa";
    cancelBtn.onclick = () => DrawAdminPage();
    formDiv.appendChild(cancelBtn);
}

function RefreshGlumciUI(container, imenaInputs, ulogeInputs, tipUlogeInputs){
    container.innerHTML = "";
    for (let i = 0; i < imenaInputs.length; i++){
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex"; wrapper.style.gap = "10px"; wrapper.style.marginBottom = "10px";
        wrapper.style.padding = "10px"; wrapper.style.backgroundColor = "#111"; wrapper.style.border = "1px solid #333";
        container.appendChild(wrapper);

        const addField = (lbl, inputElement) => {
            inputElement.placeholder = lbl; inputElement.classList.add("input");
            inputElement.style.margin = "0"; wrapper.appendChild(inputElement);
        }
        addField("Ime", imenaInputs[i]); addField("Uloga", ulogeInputs[i]); addField("Tip", tipUlogeInputs[i]);

        const delBtn = document.createElement("button");
        delBtn.innerText = "X";
        delBtn.style.color = "red"; delBtn.style.background = "none";
        delBtn.style.border = "1px solid red"; delBtn.style.cursor = "pointer"; delBtn.style.fontWeight = "bold";
        delBtn.onclick = () => {
            imenaInputs.splice(i, 1); ulogeInputs.splice(i, 1); tipUlogeInputs.splice(i, 1);
            RefreshGlumciUI(container, imenaInputs, ulogeInputs, tipUlogeInputs); 
        };
        wrapper.appendChild(delBtn);
    };
}

const postaviFilm = async (naziv, zanr, opis, dugiOpis, reziser, glumci, fileInput) => {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("Id", "0"); formData.append("Naziv", naziv); formData.append("Opis", opis);
    formData.append("DugiOpis", dugiOpis); formData.append("Reziser", reziser); formData.append("Zanr", zanr);
    formData.append("JsonGlumci", JSON.stringify(glumci)); 
    if(file) formData.append("Slika", file);
   
    try {
        const response = await fetch("https://localhost:7172/api/Film/PostaviFilm", { method: "POST", body: formData });
        if (response.ok) { alert("Uspešno!"); DrawAdminPage(); } 
        else { const text = await response.text(); alert("Greška: " + text); }
    } catch (error) { console.error(error); }
};

const izmeniFilm = async (id,naziv,zanr,opis,dugiOpis,reziser,glumci,fileInput) => {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("Id", id); formData.append("Naziv", naziv); formData.append("Opis", opis);
    formData.append("DugiOpis", dugiOpis); formData.append("Reziser", reziser); formData.append("Zanr", zanr);
    formData.append("JsonGlumci", JSON.stringify(glumci))
    if(file) formData.append("Slika", file);
    
    try {
        const response = await fetch("https://localhost:7172/api/Film/IzmeniFilm", { method: "PUT", body: formData });
        if (response.ok) { alert("Uspešno!"); DrawAdminPage(); } 
        else { alert("Greška pri izmeni."); }
    } catch (error) { console.error(error); }
};