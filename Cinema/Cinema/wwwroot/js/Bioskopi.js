import { DrawProjekcijePage } from "./Projekcije.js"; 
import { DrawAdminHeader, DrawUserHeader } from "./Navigation.js"; 

export class Bioskop {
    constructor(host, id, naziv, adresa, grad, isAdmin) {
        this.host = host;
        this.id = id;
        this.naziv = naziv;
        this.adresa = adresa;
        this.grad = grad;
        this.isAdmin = isAdmin; 
        
        this.modal = document.createElement("div");
        this.modal.classList.add("modal");
        document.body.appendChild(this.modal);
    }

    Kartica() {
        const card = document.createElement("div");
        card.classList.add("movie-card");
        this.host.appendChild(card);

        card.onclick = () => { 
            if (this.isAdmin) {
                this.OtvoriAdminModal(); 
            } else {
                DrawProjekcijePage(this.id, this.naziv, this.adresa, false); 
            }
        }

        const img = document.createElement("img");
        img.src = "https://cdn-icons-png.flaticon.com/512/2809/2809590.png"; 
        img.style.padding = "40px"; 
        img.style.backgroundColor = "#111";
        card.appendChild(img);

        const info = document.createElement("div");
        info.classList.add("movie-card-info");
        
        const title = document.createElement("div"); 
        title.innerText = this.naziv; 
        title.classList.add("movie-card-title"); 
        info.appendChild(title);

        const grad = document.createElement("div"); 
        grad.innerText = this.grad; 
        grad.classList.add("movie-card-genre"); 
        info.appendChild(grad);
        
        const adresa = document.createElement("div"); 
        adresa.innerText = this.adresa; 
        adresa.style.fontSize = "0.85rem"; 
        adresa.style.color = "#aaa"; 
        adresa.style.marginTop = "5px"; 
        adresa.style.borderTop = "1px solid #333"; 
        adresa.style.paddingTop = "5px"; 
        info.appendChild(adresa);

        card.appendChild(info);
    }

    // --- MODAL (SAMO ZA ADMINA) ---
    OtvoriAdminModal() {
        this.modal.innerHTML = "";
        this.modal.style.display = "block";
        
        const modalContent = document.createElement("div");
        modalContent.classList.add("neon-modal");
        
        const closeIcon = document.createElement("button");
        closeIcon.innerHTML = "&times;";
        closeIcon.classList.add("modal-close-icon");
        closeIcon.onclick = () => { this.modal.style.display = "none"; };
        modalContent.appendChild(closeIcon);

        const info = document.createElement("div");
        info.style.textAlign = "center";
        info.innerHTML = `<h2 style="color:white; margin-bottom:20px">${this.naziv}</h2>`;

        const btnRow = document.createElement("div");
        btnRow.classList.add("admin-btn-row");
        btnRow.style.display = "flex";
        btnRow.style.flexDirection = "column";
        btnRow.style.gap = "10px";

        const btnProj = document.createElement("button");
        btnProj.innerText = "UPRAVLJAJ PROJEKCIJAMA";
        btnProj.classList.add("button");
        btnProj.style.background = "#39ff14";
        btnProj.style.color = "black";
        btnProj.onclick = () => {
            this.modal.style.display = "none";

            DrawProjekcijePage(this.id, this.naziv, this.adresa, true); 
        };
        btnRow.appendChild(btnProj);

        // 2. DUGME IZMENI
        const editBtn = document.createElement("button");
        editBtn.innerText = "IZMENI BIOSKOP";
        editBtn.classList.add("btn-edit"); 
        editBtn.style.width = "100%";
        editBtn.onclick = () => {
            this.modal.style.display = "none";
            DrawBioskopForm(this.id, this.naziv, this.adresa, this.grad, true);
        };
        btnRow.appendChild(editBtn);

        // 3. DUGME OBRIŠI
        const delBtn = document.createElement("button");
        delBtn.innerText = "OBRIŠI BIOSKOP";
        delBtn.classList.add("btn-delete"); 
        delBtn.style.width = "100%";
        delBtn.onclick = () => {
            if(confirm("Da li ste sigurni da želite da obrišete ovaj bioskop i sve njegove projekcije?")) {
                this.modal.style.display = "none";
                obrisiBioskop(this.grad, this.id);
            }
        };
        btnRow.appendChild(delBtn);

        info.appendChild(btnRow);
        modalContent.appendChild(info);
        this.modal.appendChild(modalContent);
    }
}

export async function DrawBioskopiPage(isAdmin) {
    const host = document.getElementById("app");
    host.innerHTML = "";
    
    if (isAdmin) {
        DrawAdminHeader(host, "bioskopi"); 
    } else {
        DrawUserHeader(host, "bioskopi"); 
    }

    const contentWrapper = document.createElement("div");
    contentWrapper.style.padding = "20px";
    contentWrapper.style.textAlign = "center";
    host.appendChild(contentWrapper);

    const toolsContainer = document.createElement("div");
    toolsContainer.classList.add("admin-toolbar"); 
    toolsContainer.style.justifyContent = isAdmin ? "space-between" : "flex-end"; 
    contentWrapper.appendChild(toolsContainer);

    if (isAdmin) {
        const btnAdd = document.createElement("button");
        btnAdd.innerText = "+ DODAJ BIOSKOP";
        btnAdd.classList.add("button");
        btnAdd.onclick = () => { DrawBioskopForm(); };
        toolsContainer.appendChild(btnAdd);
    }

    const searchContainer = document.createElement("div");
    searchContainer.style.display = "flex"; 
    searchContainer.style.alignItems = "center";
    
    const labelSearch = document.createElement("span"); 
    labelSearch.innerText = "GRAD:"; 
    labelSearch.classList.add("search-label");
    searchContainer.appendChild(labelSearch);

    const citySelect = document.createElement("select");
    citySelect.classList.add("input"); 
    citySelect.style.minWidth = "200px"; 
    citySelect.style.marginBottom = "0";
    searchContainer.appendChild(citySelect);
    
    toolsContainer.appendChild(searchContainer);

    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("CardRow");
    contentWrapper.appendChild(cardsContainer);

    try {

        const token = localStorage.getItem("token");
        console.log(token)
        const resGradovi = await fetch("https://localhost:7172/api/Bioskop/ListaGradova", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        
        });
        if(resGradovi.ok) {
            const gradovi = await resGradovi.json();
            const allOption = document.createElement("option"); 
            allOption.value = "all"; 
            allOption.innerText = "--- SVI GRADOVI ---";
            citySelect.appendChild(allOption);
            
            gradovi.forEach(g => {
                const opt = document.createElement("option"); 
                opt.value = g; 
                opt.innerText = g;
                citySelect.appendChild(opt);
            });
        }
    } catch(err) { console.error(err); }

    const fetchBioskopi = async (grad = "all") => {

        const token = localStorage.getItem("token");
        cardsContainer.innerHTML = "<h3 style='color:white'>Učitavanje...</h3>";
        
        let url = "https://localhost:7172/api/Bioskop/ListaBioskopa";
        if (grad !== "all") {
            url += `/${grad}`;
        }

        try {
            const response = await fetch(url,{
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            
            if (!response.ok) {
                const greskaTekst = await response.text(); 
                throw new Error(greskaTekst); 
            }

            const data = await response.json();
            
            cardsContainer.innerHTML = ""; 
            if (data.length === 0) cardsContainer.innerHTML = "<h3>Nema bioskopa za izabrani kriterijum.</h3>";
            else {
                data.forEach(d => {
                    let b = new Bioskop(cardsContainer, d.id, d.naziv, d.adresa, d.grad, isAdmin);
                    b.Kartica();
                });
            }
        } catch (error) { 
            console.error(error);
            cardsContainer.innerHTML = `<h3 style="color:red">Greška servera: ${error.message}</h3>`; 
        }
    };

    fetchBioskopi("all");
    citySelect.onchange = () => { fetchBioskopi(citySelect.value); };
}

export function DrawBioskopForm(id = "", naziv = "", adresa = "", grad = "", edit = false) {
    const host = document.getElementById("app");
    host.innerHTML = "";
    DrawAdminHeader(host, "bioskopi"); 

    const mainContainer = document.createElement("div");
    mainContainer.classList.add("Container"); 
    mainContainer.style.maxWidth = "600px"; 
    host.appendChild(mainContainer);

    const header = document.createElement("h2"); 
    header.innerText = edit ? "IZMENI BIOSKOP" : "DODAJ NOVI BIOSKOP";
    mainContainer.appendChild(header);

    const formDiv = document.createElement("div"); 
    mainContainer.appendChild(formDiv);

    const createInput = (lbl, val) => {
        const div = document.createElement("div"); 
        div.style.marginBottom = "15px";
        const l = document.createElement("div"); 
        l.innerText = lbl; 
        l.style.color="#39ff14"; 
        l.style.fontWeight="bold"; 
        l.style.marginBottom="5px"; 
        div.appendChild(l);
        const i = document.createElement("input"); 
        i.classList.add("input"); 
        i.value = val; 
        div.appendChild(i);
        formDiv.appendChild(div);
        return i;
    }

    const inNaziv = createInput("Naziv Bioskopa:", naziv);
    const inGrad = createInput("Grad:", grad);
    const inAdresa = createInput("Adresa:", adresa);

    if (edit) { inGrad.disabled = true; inGrad.style.opacity = "0.5"; }

    const btnSave = document.createElement("button");
    btnSave.innerText = edit ? "SAČUVAJ" : "KREIRAJ";
    btnSave.classList.add("button"); 
    btnSave.style.width = "100%"; 
    btnSave.style.marginTop = "20px"; 
    btnSave.style.backgroundColor = "#39ff14"; 
    btnSave.style.color = "black";
    
    btnSave.onclick = async () => {
        if(!inNaziv.value || !inAdresa.value || !inGrad.value) return;
        
        const obj = { 
            id: edit ? id : "", 
            naziv: inNaziv.value, 
            adresa: inAdresa.value, 
            grad: inGrad.value 
        };

        const token = localStorage.getItem("token");
        
        const url = edit ? "https://localhost:7172/api/Bioskop/IzmeniBioskop" : "https://localhost:7172/api/Bioskop/DodajBioskop";
        const method = edit ? "PUT" : "POST";
        
        try {
            const resp = await fetch(url, { 
                method: method, 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }, 
                body: JSON.stringify(obj) 
            });
            if(resp.ok) { DrawBioskopiPage(true); } 
            else { alert(await resp.text()); }
        } catch(e) { alert("Greška"); }
    };
    formDiv.appendChild(btnSave);

    const btnCancel = document.createElement("button");
    btnCancel.innerText = "ODUSTANI";
    btnCancel.classList.add("button"); 
    btnCancel.style.width = "100%"; 
    btnCancel.style.marginTop = "10px"; 
    btnCancel.style.borderColor = "#555"; 
    btnCancel.style.color = "#aaa";
    btnCancel.onclick = () => DrawBioskopiPage(true);
    formDiv.appendChild(btnCancel);
}

async function obrisiBioskop(grad, id) {
    try {

        const token = localStorage.getItem("token");
        const resp = await fetch(`https://localhost:7172/api/Bioskop/ObrisiBioskop/${grad}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if(resp.ok) DrawBioskopiPage(true);
    } catch(e) { console.error(e); }
}