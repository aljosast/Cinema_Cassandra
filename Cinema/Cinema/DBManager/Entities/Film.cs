namespace Cinema.DBManager.Entities
{
    public class Film
    {
        public string ID { get; set; }
        public string Naziv { get; set; }
        public string Zanr { get; set; }
        public string Opis { get; set; }
        public string DugiOpis { get; set; }
        public string Reziser { get; set; }
        public List<Glumac> Glumci {  get; set; } 
        public string Slika { get; set; }
    }
}
