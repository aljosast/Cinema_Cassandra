import { DrawAdminHeader, DrawUserHeader } from "./Navigation.js";

export class ProjekcijePage {
    constructor(host, bioskopId, bioskopNaziv, bioskopAdresa, isAdmin) {
        this.host = host;
        this.bioskopId = bioskopId;
        this.bioskopNaziv = bioskopNaziv;
        this.bioskopAdresa = bioskopAdresa;
        this.isAdmin = isAdmin;
        
        this.data = []; 
        this.filmoviLista = []; 
        this.username = localStorage.getItem("username");
    }

    async DrawPage() {
        this.host.innerHTML = "";
        
        // 1. Header Logic
        if (this.isAdmin) DrawAdminHeader(this.host, "bioskopi");
        else DrawUserHeader(this.host, "bioskopi");

        const container = document.createElement("div");
        container.classList.add("Container");
        this.host.appendChild(container);

        // 2. Dugme NAZAD (Samo za korisnike)
        if (!this.isAdmin) {
            const btnBack = document.createElement("button");
            btnBack.innerHTML = "&#8592; NAZAD NA BIOSKOPE"; 
            btnBack.classList.add("modal-text-btn"); 
            btnBack.style.marginBottom = "20px";
            
            btnBack.onclick = () => {
                import("./Bioskopi.js").then(module => {
                    module.DrawBioskopiPage(false);
                });
            };
            container.appendChild(btnBack);
        }

        // 3. Naslov i Info
        const headerDiv = document.createElement("div");
        headerDiv.style.textAlign = "center";
        headerDiv.style.marginBottom = "30px";
        headerDiv.innerHTML = `
            <h2 style="text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">
                REPERTOAR: <span style="color:#39ff14">${this.bioskopNaziv}</span>
            </h2>
            <div style="color: #aaa; font-size: 1rem;">📍 ${this.bioskopAdresa}</div>
        `;
        container.appendChild(headerDiv);

        // 4. Dugme za novu projekciju (Samo Admin)
        if (this.isAdmin) {
            const btnAdd = document.createElement("button");
            btnAdd.innerText = "+ NOVA PROJEKCIJA";
            btnAdd.classList.add("button");
            btnAdd.style.display = "block";
            btnAdd.style.margin = "0 auto 30px auto";
            btnAdd.onclick = () => this.OpenFormModal(); 
            container.appendChild(btnAdd);
        }

        // 5. Učitavanje podataka
        const loading = document.createElement("div");
        loading.innerText = "Učitavanje podataka...";
        loading.className = "loading-text-neon"; 
        loading.style.textAlign = "center";
        loading.style.color = "#39ff14";
        container.appendChild(loading);

        await this.FetchProjekcije();
        if(this.isAdmin) await this.FetchFilmove(); 

        container.removeChild(loading);

        // 6. Crtanje
        this.DrawGrid(container);
    }

    async FetchProjekcije() {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://localhost:7172/api/Projekcija/ListaProjekcija/${this.bioskopId}`, {
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                }
            });
            if(res.ok) this.data = await res.json();
            else this.data = [];
        } catch(e) { console.error(e); }
    }

    async FetchFilmove() {
        try {
            const res = await fetch(`https://localhost:7172/api/Film/ListaFilmova/0`); 
            if(res.ok) this.filmoviLista = await res.json();
        } catch(e) { console.error(e); }
    }

    DrawGrid(container) {
        const grid = document.createElement("div");
        grid.classList.add("CardRow"); 
        container.appendChild(grid);

        if(!this.data || this.data.length === 0) {
            grid.innerHTML = "<h3 style='color:#777; width:100%; text-align:center;'>Nema zakazanih projekcija.</h3>";
            return;
        }

        this.data.forEach(p => {
            this.DrawCard(grid, p);
        });
    }

    DrawCard(host, p) {
        const card = document.createElement("div");
        card.classList.add("movie-card"); 
        
        const imgUrl = p.slika ? `https://localhost:7172/images/${p.slika}` : "https://via.placeholder.com/300x400?text=No+Image";
        const naziv = p.nazivFilma || "Nepoznat film";
        const vreme = new Date(p.vreme).toLocaleString('sr-RS', { day:'numeric', month:'numeric', hour:'2-digit', minute:'2-digit'});
        const cena = p.cena || 0;
        const sala = p.brojSale || 1;
        
        // --- LOGIKA ZA MESTA (FRONTEND CALCULATION) ---
        const ukupno = p.brojMesta || p.BrojMesta || 0;
        const rezervisano = p.brojRezervacija || p.BrojRezervacija || 0;
        
        let slobodnaMesta = ukupno - rezervisano;
        if (slobodnaMesta < 0) slobodnaMesta = 0;

        const isSoldOut = slobodnaMesta <= 0;
        // Boje: Crvena (0), Narandžasta (<10), Zelena (Ok)
        const seatsColor = isSoldOut ? "#ff3131" : (slobodnaMesta < 10 ? "orange" : "#39ff14");

        card.innerHTML = `
            <div style="position: relative; height: 200px; overflow: hidden;">
                <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: #39ff14; padding: 5px 8px; border-radius: 5px; font-weight: bold; border: 1px solid #39ff14;">
                    ${cena} RSD
                </div>
            </div>
            <div style="padding: 15px; display: flex; flex-direction: column; gap: 5px;">
                <h3 style="margin: 0; color: white; font-size: 1.2rem;">${naziv}</h3>
                <div style="color: #aaa; font-size: 0.9rem;">🕒 ${vreme}</div>
                <div style="color: #aaa; font-size: 0.9rem;">🏛 Sala: ${sala}</div>
                
                <div style="color: ${seatsColor}; font-size: 0.9rem; font-weight: bold; margin-top: 5px;">
                    Slobodna mesta: ${slobodnaMesta} / ${ukupno}
                </div>
                
                <div class="actions" style="margin-top: 15px;">
                </div>
            </div>
        `;

        const actionsDiv = card.querySelector(".actions");

        if (this.isAdmin) {
            // ADMIN ACTIONS
            actionsDiv.style.display = "flex";
            actionsDiv.style.gap = "10px";

            const btnEdit = document.createElement("button");
            btnEdit.innerText = "IZMENI";
            btnEdit.className = "btn-edit"; 
            btnEdit.style.flex = "1";
            btnEdit.onclick = () => this.OpenFormModal(p);
            
            const btnDel = document.createElement("button");
            btnDel.innerText = "OBRIŠI";
            btnDel.className = "btn-delete"; // Koristimo klasu iz CSS-a
            btnDel.style.flex = "1";
            btnDel.onclick = () => this.DeleteProjekcija(p.id);

            actionsDiv.appendChild(btnEdit);
            actionsDiv.appendChild(btnDel);

        } else {
            // USER ACTIONS
            const btnRez = document.createElement("button");
            btnRez.className = "button";
            btnRez.style.width = "100%";
            btnRez.style.fontWeight = "bold";

            if (isSoldOut) {
                btnRez.innerText = "POPUNJENO";
                btnRez.style.borderColor = "#555";
                btnRez.style.color = "#555";
                btnRez.style.cursor = "not-allowed";
                btnRez.disabled = true;
                // Uklanjamo hover efekat
                btnRez.onmouseover = null;
            } else {
                btnRez.innerText = "REZERVIŠI";
                btnRez.onclick = () => this.OpenReservationModal(p, slobodnaMesta); 
            }
            
            actionsDiv.appendChild(btnRez);
        }

        host.appendChild(card);
    }

    // --- MODAL ZA REZERVACIJU (USER) ---
    OpenReservationModal(p, maxMesta) {
        if (!this.username) {
            alert("Morate biti prijavljeni da biste rezervisali kartu.");
            return;
        }
    
        const modal = document.createElement("div");
        modal.className = "modal";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
    
        const cenaPoKarti = p.cena || 0;
    
        modal.innerHTML = `
            <div class="neon-modal" style="width: 400px; text-align: center; position: relative;">
                <button class="modal-close-icon" id="closeReservation">&times;</button>
                <h2 style="color: #39ff14; margin-bottom: 10px;">REZERVACIJA</h2>
                <h4 style="color: white; margin-bottom: 5px;">${p.nazivFilma}</h4>
                <p style="color: orange; font-size: 0.8rem; margin-bottom: 20px;">Dostupno: ${maxMesta}</p>
                
                <div style="margin-bottom: 20px;">
                    <label style="color:#aaa; display:block; margin-bottom:5px;">Broj mesta:</label>
                    <input type="number" id="rezMesta" value="1" min="1" max="${maxMesta}" class="input" style="text-align:center; font-size:1.2rem;">
                    <div id="errorMsg" style="color:red; font-size:0.8rem; display:none; margin-top:5px;"></div>
                </div>
    
                <div style="margin-bottom: 20px;">
                    Ukupno: <span id="rezTotal" style="color:#39ff14; font-size:1.5rem; font-weight:bold;">${cenaPoKarti}</span> RSD
                </div>
    
                <button id="btnPotvrdiRez" class="button" style="width:100%; background:#39ff14; color:black;">POTVRDI</button>
            </div>
        `;
    
        document.body.appendChild(modal);
    
        const closeBtn = modal.querySelector("#closeReservation");
        const inp = modal.querySelector("#rezMesta");
        const out = modal.querySelector("#rezTotal");
        const errorMsg = modal.querySelector("#errorMsg");
        const btnPotvrdi = modal.querySelector("#btnPotvrdiRez");
    
        closeBtn.onclick = () => modal.remove();
    
        // Live kalkulacija i validacija
        inp.oninput = () => {
            let val = parseInt(inp.value);
            
            if (val > maxMesta) {
                errorMsg.style.display = "block";
                errorMsg.innerText = `Maksimalno ${maxMesta} mesta!`;
                inp.value = maxMesta; 
                val = maxMesta;
            } else if (val < 1 || isNaN(val)) {
                inp.value = 1;
                val = 1;
                errorMsg.style.display = "none";
            } else {
                errorMsg.style.display = "none";
            }

            out.innerText = val * cenaPoKarti;
        };
    
        btnPotvrdi.onclick = async () => {
            const seats = parseInt(inp.value);

            if (seats > maxMesta) {
                alert(`Nema dovoljno mesta.`);
                return;
            }

            const dto = {
                id: self.crypto.randomUUID(),
                username: this.username,
                projekcijaID: p.id,
                bioskopID: this.bioskopId,
                vremeProjekcije: p.vreme, 
                nazivFilma: p.nazivFilma,
                nazivBioskopa: this.bioskopNaziv,
                adresaBioskopa: this.bioskopAdresa,
                brojMesta: seats,
                ukupnaCena: seats * cenaPoKarti
            };
    
            try {
                const token = localStorage.getItem("token");
                const r = await fetch("https://localhost:7172/api/Rezervacija/Rezervacija", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify(dto)
                });
    
                if (r.ok) {
                    alert("Uspešno ste rezervisali kartu!");
                    modal.remove();
                    this.DrawPage(); 
                } else {
                    alert("Greška: " + await r.text());
                }
            } catch (err) {
                console.error(err);
                alert("Greška na serveru.");
            }
        };
    }

    // --- MODAL ZA ADMINA (CRUD) ---
    OpenFormModal(p = null) {
        const isEdit = p !== null;
        const modal = document.createElement("div");
        modal.className = "modal";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";

        const content = document.createElement("div");
        content.className = "neon-modal";
        
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&times;";
        closeBtn.className = "modal-close-icon";
        closeBtn.onclick = () => modal.remove();
        content.appendChild(closeBtn);

        const title = document.createElement("h2");
        title.innerText = isEdit ? "IZMENI PROJEKCIJU" : "NOVA PROJEKCIJA";
        title.style.color = "white";
        content.appendChild(title);

        const form = document.createElement("div");
        form.style.marginTop = "20px";

        // Select Film
        const lbl1 = document.createElement("div"); lbl1.innerText="FILM:"; lbl1.className="label";
        form.appendChild(lbl1);
        
        const selFilm = document.createElement("select"); 
        selFilm.className="input";
        
        this.filmoviLista.forEach(f => {
            const op = document.createElement("option");
            op.value = f.id || f.ID;
            op.innerText = f.naziv || f.Naziv;
            op.dataset.naziv = f.naziv || f.Naziv; 
            selFilm.appendChild(op);
        });
        if(isEdit) selFilm.value = p.filmID;
        form.appendChild(selFilm);

        // Inputs
        const createInp = (lbl, val, type="text") => {
            const l = document.createElement("div"); l.innerText=lbl; l.className="label";
            form.appendChild(l);
            const i = document.createElement("input"); i.className="input"; i.type=type; i.value=val;
            form.appendChild(i);
            return i;
        }

        const inSala = createInp("BROJ SALE:", isEdit ? p.brojSale : "", "number");
        const inMesta = createInp("UKUPNO MESTA:", isEdit ? p.brojMesta : "", "number");
        const inCena = createInp("CENA (RSD):", isEdit ? p.cena : "", "number");
        const inVreme = createInp("VREME:", isEdit ? p.vreme : "", "datetime-local");

        const btnSave = document.createElement("button");
        btnSave.innerText = "SAČUVAJ";
        btnSave.className = "button";
        btnSave.style.marginTop = "20px";
        btnSave.style.width = "100%";
        btnSave.style.backgroundColor = "#39ff14";
        btnSave.style.color = "black";

        btnSave.onclick = async () => {
            if(!inSala.value || !inMesta.value || !inCena.value || !inVreme.value) {
                alert("Popunite sva polja!"); return;
            }
            const selOpt = selFilm.options[selFilm.selectedIndex];
            
            const obj = {
                ID: isEdit ? p.id : "",
                BioskopID: this.bioskopId,
                FilmID: selFilm.value,
                NazivFilma: selOpt.dataset.naziv,
                BrojSale: parseInt(inSala.value),
                BrojMesta: parseInt(inMesta.value),
                // BITNO: Čuvamo postojeće rezervacije da ne resetujemo na 0
                BrojRezervacija: isEdit ? (p.brojRezervacija || 0) : 0, 
                Vreme: inVreme.value,
                Cena: parseFloat(inCena.value),
                Slika: isEdit ? p.slika : "" 
            };

            const url = isEdit ? "https://localhost:7172/api/Projekcija/IzmeniProjekciju" : "https://localhost:7172/api/Projekcija/DodajProjekciju";
            const method = isEdit ? "PUT" : "POST";

            try {
                const token = localStorage.getItem("token");
                const r = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(obj)
                });
                if(r.ok) {
                    modal.remove();
                    this.DrawPage(); 
                } else {
                    alert("Greška: " + await r.text());
                }
            } catch(e) { console.error(e); }
        };

        form.appendChild(btnSave);
        content.appendChild(form);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    async DeleteProjekcija(id) {
        if(!confirm("Da li ste sigurni da želite da obrišete projekciju?")) return;
        try {
            const token = localStorage.getItem("token");
            const r = await fetch(`https://localhost:7172/api/Projekcija/ObrisiProjekciju/${this.bioskopId}/${id}`,
                {
                    headers: { "Authorization": `Bearer ${token}` },
                    method: "DELETE"
                });
            if(r.ok) this.DrawPage();
            else alert("Greška pri brisanju.");
        } catch(e) { console.error(e); }
    }
}

// Global Export
export function DrawProjekcijePage(bioskopId, bioskopNaziv, bioskopAdresa, isAdmin) {
    const app = document.getElementById("app");
    const page = new ProjekcijePage(app, bioskopId, bioskopNaziv, bioskopAdresa, isAdmin);
    page.DrawPage();
}