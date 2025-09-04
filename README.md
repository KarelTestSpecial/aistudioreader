# Google AI Studio - File Reader

Dit is een eenvoudige, privacy-gerichte Chrome-extensie die is ontworpen om geëxporteerde conversatielogboeken van Google's AI Studio te converteren naar een leesbaar Markdown-formaat.

## Functionaliteit

Wanneer u een conversatie exporteert vanuit Google AI Studio, wordt deze opgeslagen in een `.json`-bestandsformaat. Hoewel dit formaat nuttig is voor machinale verwerking, is het niet ideaal om snel te lezen of te delen. Deze extensie lost dat probleem op.

-   **Lokale Verwerking**: Alle bestandsverwerking gebeurt volledig op uw eigen computer. Uw bestanden worden nooit geüpload naar een externe server.
-   **Eenvoudige Interface**: Een duidelijke en eenvoudige interface stelt u in staat om een bestand te selecteren of te slepen en neer te zetten voor conversie.
-   **Markdown-conversie**: De extensie converteert de JSON-gegevens naar een overzichtelijk Markdown-bestand, met een duidelijke scheiding tussen gebruikersinvoer en modelantwoorden.
-   **Automatische Download**: Na de conversie wordt het `.md`-bestand automatisch gedownload naar uw computer.

## Hoe te gebruiken

1.  **Installeer de extensie** vanuit de Chrome Web Store.
2.  **Klik op het extensiepictogram** in uw browserwerkbalk. Er wordt een nieuw tabblad geopend met de conversiepagina.
3.  **Selecteer uw `.json`-bestand**:
    -   Klik op de knop "Selecteer Bestand" en kies het `.json`-bestand dat u hebt geëxporteerd uit AI Studio.
    -   OF sleep het `.json`-bestand naar het daarvoor bestemde gebied.
4.  **Wacht op de conversie**: De extensie verwerkt het bestand onmiddellijk.
5.  **Download**: De download van het geconverteerde `.md`-bestand start automatisch.

## Privacy

Uw privacy is van het grootste belang. Zoals vermeld, vindt alle verwerking lokaal plaats. De extensie verzamelt of verzendt geen persoonlijke gegevens. Voor meer details, zie ons privacybeleid.

## Technische Details

-   **Manifest V3**: Gebouwd met de nieuwste Chrome-extensiestandaarden voor verbeterde beveiliging en prestaties.
-   **Geen speciale machtigingen**: De extensie vereist geen speciale machtigingen, omdat het gebruikmaakt van de standaard browser-API's voor bestandsverwerking.
