"use client";

import React, { useState, useCallback, memo, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMissionInsight } from '../services/geminiService';

interface MissionMetric {
    label: string;
    value: string;
}

interface RelatedDiscovery {
    title: string;
    description: string;
}

// --- New Archive Interfaces ---
interface ArchivePaper {
    title: string;
    source: string;
    url: string;
}

interface ArchiveLink {
    label: string;
    type: string;
    url: string;
}

interface ArchiveUpdate {
    date: string;
    headline: string;
    snippet: string;
}

interface MissionArchive {
    papers: ArchivePaper[];
    links: ArchiveLink[];
    updates: ArchiveUpdate[];
}

interface Mission {
    id: string;
    name: string;
    year: string;
    status: 'PAST' | 'CURRENT' | 'FUTURE';
    description: string;
    image: string;
    milestones: string[];
    objectives: string[];
    metrics: MissionMetric[];
    discoveries: RelatedDiscovery[];
    archive: MissionArchive;
}

const MISSIONS: Mission[] = [
    {
        id: 'sputnik', name: 'Sputnik 1', year: '1957', status: 'PAST',
        description: 'The first artificial Earth satellite. It orbited for three weeks before its batteries died, marking the start of the Space Age.',
        image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1000&auto=format&fit=crop',
        milestones: ['Oct 4: Launch', 'Oct 26: Signal Lost', 'Jan 4: Re-entry'],
        objectives: ['Test orbital insertion', 'Atmospheric density data', 'Radio propogation'],
        metrics: [{ label: 'Orbits', value: '1,440' }, { label: 'Speed', value: '29k km/h' }, { label: 'Mass', value: '83.6 kg' }],
        discoveries: [
            { title: 'Atmospheric Density', description: 'Deduced from satellite drag on the orbit.' },
            { title: 'Ionosphere Transmission', description: 'Radio signals provided data on electron density.' }
        ],
        archive: {
            papers: [
                { title: "Sputnik 1: The First Artificial Earth Satellite", source: "NASA History Division", url: "https://history.nasa.gov/sputnik/" },
                { title: "Method of Determining the Potential of the Body in Plasma", source: "Soviet Physics Uspekhi", url: "https://ui.adsabs.harvard.edu/abs/1960SvPhU...2..636G/abstract" },
                { title: "Radio Observations of the First Russian Earth Satellites", source: "Nature Journal (1957)", url: "https://www.nature.com/articles/1801105a0" }
            ],
            links: [
                { label: "NSSDC Master Catalog Entry", type: "EXTERNAL", url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1957-001B" },
                { label: "Sputnik Audio Recording", type: "MEDIA", url: "https://www.nasa.gov/history/sputnik-1/" },
                { label: "Orbital Parameter Data", type: "DATA", url: "https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/sputnik1.html" }
            ],
            updates: [
                { date: "1958-01-04", headline: "Orbital Decay Complete", snippet: "Sputnik 1 re-entered Earth's atmosphere after completing 1,440 orbits, disintegrating upon re-entry." },
                { date: "1957-10-26", headline: "Batteries Depleted", snippet: "The final radio signal was received, ending the active phase of the mission." },
                { date: "1957-10-05", headline: "Global Detection", snippet: "Amateur radio operators worldwide confirm reception of the 20.005 MHz beep." }
            ]
        }
    },
    {
        id: 'vostok', name: 'Vostok 1', year: '1961', status: 'PAST',
        description: 'Yuri Gagarin becomes the first human to journey into outer space, completing one orbit around Earth.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
        milestones: ['Launch 06:07 UTC', 'Orbit Entry', 'Landing 07:55 UTC'],
        objectives: ['First human flight', 'Life support test', 'Manual controls'],
        metrics: [{ label: 'Duration', value: '108 min' }, { label: 'Altitude', value: '327 km' }, { label: 'Crew', value: '1' }],
        discoveries: [
            { title: 'Human Spaceflight Viability', description: 'Confirmed humans can survive and function in microgravity.' },
            { title: 'Earth Observation', description: 'First visual descriptions of Earth from orbit.' }
        ],
        archive: {
            papers: [
                { title: "First Man in Space: The Life and Legend of Yuri Gagarin", source: "Journal of British Interplanetary Society", url: "https://www.bis-space.com/" },
                { title: "Vostok 1 Launch and Flight Parameters", source: "Roscosmos Archives", url: "https://www.esa.int/About_Us/ESA_history/50_years_of_humans_in_space/The_flight_of_Vostok_1" },
                { title: "Biomedical Telemetry of the First Manned Spaceflight", source: "USSR Academy of Sciences", url: "https://history.nasa.gov/SP-4201/ch11-5.htm" }
            ],
            links: [
                { label: "ESA: The Flight of Vostok 1", type: "EXTERNAL", url: "https://www.esa.int/About_Us/ESA_history/50_years_of_humans_in_space/The_flight_of_Vostok_1" },
                { label: "Flight Transcript (English)", type: "DATA", url: "http://www.russianarchives.com/gallery/gagarin/transcript.html" },
                { label: "Vostok 3KA Spacecraft Schematics", type: "MEDIA", url: "https://airandspace.si.edu/collection-objects/spacecraft-vostok-3ka/nasm_A19980006000" }
            ],
            updates: [
                { date: "1961-04-12", headline: "Successful Landing", snippet: "Gagarin ejected from the capsule at 7km altitude and parachuted safely to the Saratov region." },
                { date: "1961-04-12", headline: "Orbit Achieved", snippet: "Vostok 1 separates from the launcher and enters a 169 x 327 km elliptical orbit." },
                { date: "1961-04-12", headline: "Poyekhali!", snippet: "Lift-off confirmed from Baikonur Cosmodrome. Gagarin transmits his famous 'Let's go!'." }
            ]
        }
    },
    {
        id: 'apollo11', name: 'Apollo 11', year: '1969', status: 'PAST',
        description: 'First humans land on the Moon. Neil Armstrong takes "one small step" for man, one giant leap for mankind.',
        image: 'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=1000&auto=format&fit=crop',
        milestones: ['Jul 16: Launch', 'Jul 20: Landing', 'Jul 24: Splashdown'],
        objectives: ['Manned Lunar Landing', 'Sample Collection', 'Solar Wind Exp.'],
        metrics: [{ label: 'EVA Time', value: '2h 31m' }, { label: 'Samples', value: '21.55 kg' }, { label: 'Cost', value: '$25B' }],
        discoveries: [
            { title: 'Lunar Geology', description: 'Samples revealed Moon rocks are similar to Earth\'s mantle.' },
            { title: 'Solar Wind Composition', description: 'Measured isotopes in solar wind using foil sheets.' }
        ],
        archive: {
            papers: [
                { title: "Apollo 11 Mission Report", source: "NASA Technical Reports Server (NTRS)", url: "https://ntrs.nasa.gov/citations/19710015566" },
                { title: "Preliminary Science Report: Apollo 11", source: "NASA SP-214", url: "https://history.nasa.gov/SP-214/sp214.htm" },
                { title: "Lunar Soil Mechanics Experiments", source: "Journal of Geophysics", url: "https://agupubs.onlinelibrary.wiley.com/journal/21699356" }
            ],
            links: [
                { label: "Apollo 11 Mission Page", type: "EXTERNAL", url: "https://www.nasa.gov/mission_pages/apollo/missions/apollo11.html" },
                { label: "Lunar Surface Journal", type: "DATA", url: "https://history.nasa.gov/alsj/a11/a11.html" },
                { label: "High-Res Image Library", type: "MEDIA", url: "https://www.flickr.com/photos/projectapolloarchive/albums/72157658601662068" }
            ],
            updates: [
                { date: "1969-07-24", headline: "Mission Complete", snippet: "Columbia splashes down in the Pacific Ocean. Crew recovered by USS Hornet." },
                { date: "1969-07-21", headline: "Lunar Lift-off", snippet: "Eagle ascent stage lifts off from the Moon to rendezvous with the Command Module." },
                { date: "1969-07-20", headline: "The Eagle Has Landed", snippet: "Touchdown at Mare Tranquillitatis. Armstrong confirms engine shutdown." }
            ]
        }
    },
    {
        id: 'voyager1', name: 'Voyager 1', year: '1977', status: 'PAST',
        description: 'Launched to study the outer Solar System, it is now the farthest man-made object from Earth, in interstellar space.',
        image: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1000&auto=format&fit=crop',
        milestones: ['Jupiter Flyby', 'Saturn Flyby', 'Interstellar Space'],
        objectives: ['Outer Planet Study', 'Magnetic Fields', 'Golden Record'],
        metrics: [{ label: 'Distance', value: '24B km' }, { label: 'Speed', value: '61k km/h' }, { label: 'Life', value: '46+ Yrs' }],
        discoveries: [
            { title: 'Volcanism on Io', description: 'First active volcanoes found outside Earth.' },
            { title: 'Saturn\'s Rings', description: 'Detailed structure and spoke formations discovered.' }
        ],
        archive: {
            papers: [
                { title: "Voyager 1: Crossing the Heliopause", source: "Science Magazine", url: "https://www.science.org/doi/10.1126/science.1241681" },
                { title: "Magnetic Field Data at the Heliospheric Boundary", source: "AGU Journals", url: "https://agupubs.onlinelibrary.wiley.com/" },
                { title: "The Voyager Interstellar Mission", source: "JPL Technical Report", url: "https://voyager.jpl.nasa.gov/mission/interstellar-mission/" }
            ],
            links: [
                { label: "JPL Voyager Homepage", type: "EXTERNAL", url: "https://voyager.jpl.nasa.gov/" },
                { label: "The Golden Record Content", type: "MEDIA", url: "https://voyager.jpl.nasa.gov/golden-record/" },
                { label: "Real-time Odometer", type: "DATA", url: "https://voyager.jpl.nasa.gov/mission/status/" }
            ],
            updates: [
                { date: "2024-06-13", headline: "Data Transmission Restored", snippet: "Engineers successfully fixed the flight data system issue, resuming full science operations." },
                { date: "2012-08-25", headline: "Interstellar Space Entered", snippet: "Voyager 1 crosses the heliopause, becoming the first human object to enter the space between stars." },
                { date: "1990-02-14", headline: "Pale Blue Dot", snippet: "The probe turns around to take the famous family portrait of the solar system." }
            ]
        }
    },
    {
        id: 'hubble', name: 'Hubble', year: '1990', status: 'PAST',
        description: 'A space telescope that has revolutionized our understanding of the cosmos with deep field imagery.',
        image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1000&auto=format&fit=crop',
        milestones: ['1990: Deployment', '1993: Optics Fix', '2009: Final Service'],
        objectives: ['Age of Universe', 'Dark Energy', 'Exoplanets'],
        metrics: [{ label: 'Data', value: '150+ TB' }, { label: 'Papers', value: '18,000+' }, { label: 'Orbit', value: '540 km' }],
        discoveries: [
            { title: 'Universe Expansion', description: 'Provided key data to determine the rate of expansion.' },
            { title: 'Black Holes', description: 'Confirmed supermassive black holes exist at galaxy centers.' }
        ],
        archive: {
            papers: [
                { title: "Hubble Space Telescope: The First 30 Years", source: "Annual Review of Astronomy", url: "https://www.annualreviews.org/journal/astro" },
                { title: "Determining the Hubble Constant", source: "Astrophysical Journal", url: "https://iopscience.iop.org/journal/0004-637X" },
                { title: "Deep Field Survey Data Analysis", source: "STScI Publications", url: "https://archive.stsci.edu/hst/" }
            ],
            links: [
                { label: "HubbleSite Official", type: "EXTERNAL", url: "https://hubblesite.org/" },
                { label: "MAST Data Archive", type: "DATA", url: "https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html" },
                { label: "Top 100 Hubble Images", type: "MEDIA", url: "https://esahubble.org/images/archive/top100/" }
            ],
            updates: [
                { date: "2024-04-24", headline: "34th Anniversary", snippet: "Hubble celebrates another year of operation with a new image of the Little Dumbbell Nebula." },
                { date: "2021-06-16", headline: "Payload Computer Switch", snippet: "Operations switch to backup hardware after a memory module degradation." },
                { date: "2009-05-11", headline: "Servicing Mission 4", snippet: "Astronauts install Wide Field Camera 3 and Cosmic Origins Spectrograph." }
            ]
        }
    },
    {
        id: 'iss', name: 'ISS', year: '1998', status: 'PAST',
        description: 'A modular space station in low Earth orbit, serving as a microgravity and space environment research laboratory.',
        image: 'https://images.unsplash.com/photo-1454789548728-85d2696cfbaf?q=80&w=1000&auto=format&fit=crop',
        milestones: ['1998: First Module', '2000: First Crew', '2011: Complete'],
        objectives: ['Microgravity Bio', 'Physics', 'Mars Prep'],
        metrics: [{ label: 'Mass', value: '440t' }, { label: 'Speed', value: '7.66 km/s' }, { label: 'Visits', value: '250+' }],
        discoveries: [
            { title: 'Protein Crystals', description: 'Growing larger, purer crystals for drug development.' },
            { title: 'Dark Matter', description: 'AMS-02 detector searches for antimatter and dark matter.' }
        ],
        archive: {
            papers: [
                { title: "Reference Guide to the International Space Station", source: "NASA Publications", url: "https://www.nasa.gov/connect/ebooks/the_iss_reg_guide_detail.html" },
                { title: "ISS Research and Discovery Statistics", source: "Acta Astronautica", url: "https://www.sciencedirect.com/journal/acta-astronautica" },
                { title: "Microgravity Crystal Growth Results", source: "Nature Microgravity", url: "https://www.nature.com/npjmgrav/" }
            ],
            links: [
                { label: "NASA ISS Homepage", type: "EXTERNAL", url: "https://www.nasa.gov/international-space-station/" },
                { label: "Spot the Station Tracker", type: "DATA", url: "https://spotthestation.nasa.gov/" },
                { label: "Live Video Feed", type: "MEDIA", url: "https://eol.jsc.nasa.gov/ESRS/HDEV/" }
            ],
            updates: [
                { date: "2024-03-21", headline: "Crew-8 Arrival", snippet: "New expedition crew docks successfully, beginning a 6-month science mission." },
                { date: "2023-11-20", headline: "25th Anniversary", snippet: "Celebrating 25 years since the launch of Zarya, the first station module." },
                { date: "2021-07-29", headline: "Nauka Module Docked", snippet: "The Multipurpose Laboratory Module expands Russian segment capabilities." }
            ]
        }
    },
    {
        id: 'curiosity', name: 'Curiosity', year: '2012', status: 'PAST',
        description: 'A car-sized Mars rover designed to explore the Gale crater on Mars as part of NASA\'s Mars Science Laboratory mission.',
        image: 'https://images.unsplash.com/photo-1614726365723-49cfae973ccb?q=80&w=1000&auto=format&fit=crop',
        milestones: ['Launch 2011', 'Landing 2012', 'Mt. Sharp 2014'],
        objectives: ['Habitability', 'Climate', 'Geology'],
        metrics: [{ label: 'Drive', value: '30+ km' }, { label: 'Samples', value: '35+' }, { label: 'Power', value: 'RTG' }],
        discoveries: [
            { title: 'Ancient Streambed', description: 'Found smooth, rounded pebbles indicating past water flow.' },
            { title: 'Organic Molecules', description: 'Detected in drilled rock samples.' }
        ],
        archive: {
            papers: [
                { title: "The Mars Science Laboratory (MSL) Rover", source: "Space Science Reviews", url: "https://link.springer.com/journal/11214" },
                { title: "In Situ Evidence for an Ancient Aqueous Environment", source: "Science Magazine", url: "https://www.science.org/doi/10.1126/science.1225980" },
                { title: "Organic Matter Preserved in 3-Billion-Year-Old Mudstones", source: "Science Magazine", url: "https://www.science.org/doi/10.1126/science.aas8966" }
            ],
            links: [
                { label: "NASA Mission Page", type: "EXTERNAL", url: "https://mars.nasa.gov/msl/home/" },
                { label: "Raw Images Database", type: "MEDIA", url: "https://mars.nasa.gov/msl/multimedia/raw-images/" },
                { label: "Where Is Curiosity?", type: "DATA", url: "https://mars.nasa.gov/maps/location/?mission=MSL" }
            ],
            updates: [
                { date: "2024-02-15", headline: "Gediz Vallis Ridge", snippet: "Curiosity reaches a formation created by ancient debris flows, rich in scientific potential." },
                { date: "2023-08-05", headline: "11 Years on Mars", snippet: "The rover celebrates its 4000th sol on the Red Planet." },
                { date: "2019-10-07", headline: "Oasis Evidence", snippet: "Found proof that Gale Crater was once a saltwater lake that dried out." }
            ]
        }
    },
    {
        id: 'jwst', name: 'JWST', year: '2021', status: 'CURRENT',
        description: 'The largest optical telescope in space, designed to see the first galaxies formed after the Big Bang.',
        image: 'https://images.unsplash.com/photo-1614728853913-1e22216503ba?q=80&w=1000&auto=format&fit=crop',
        milestones: ['Dec 25: Launch', 'Jan 24: L2 Arrival', 'Jul 12: First Image'],
        objectives: ['First Light', 'Galaxy Assembly', 'Origins of Life'],
        metrics: [{ label: 'Mirror', value: '6.5 m' }, { label: 'Temp', value: '50 K' }, { label: 'Cost', value: '$10B' }],
        discoveries: [
            { title: 'Exoplanet Atmospheres', description: 'Detailed spectral analysis of WASP-96b.' },
            { title: 'Early Galaxies', description: 'Imaged galaxies from just a few hundred million years after Big Bang.' }
        ],
        archive: {
            papers: [
                { title: "The James Webb Space Telescope: Science Guide", source: "STScI Publications", url: "https://www.stsci.edu/jwst/about-jwst/history" },
                { title: "Characterization of Exoplanet Atmospheres with JWST", source: "Nature Astronomy", url: "https://www.nature.com/natastron/" },
                { title: "First Results from JWST Early Release Science", source: "Astrophysical Journal Letters", url: "https://iopscience.iop.org/journal/2041-8205" }
            ],
            links: [
                { label: "Webb Telescope Official", type: "EXTERNAL", url: "https://webbtelescope.org/" },
                { label: "Deployment Explorer", type: "DATA", url: "https://webb.nasa.gov/content/webbLaunch/whereIsWebb.html" },
                { label: "First Images Collection", type: "MEDIA", url: "https://www.nasa.gov/webbfirstimages" }
            ],
            updates: [
                { date: "2024-01-24", headline: "Major Anniversary", snippet: "Two years since arrival at L2 Lagrange point, surpassing all science goals." },
                { date: "2023-09-12", headline: "K2-18 b Findings", snippet: "Detects carbon-bearing molecules in the habitable-zone exoplanet's atmosphere." },
                { date: "2022-07-12", headline: "First Full-Color Images", snippet: "NASA releases the deepest infrared image of the universe to date." }
            ]
        }
    },
    {
        id: 'artemis2', name: 'Artemis II', year: '2025', status: 'CURRENT',
        description: 'Planned mission to send four astronauts around the Moon and back, paving the way for lunar landings.',
        image: 'https://images.unsplash.com/photo-1540573133985-87b6da6dce60?q=80&w=1000&auto=format&fit=crop',
        milestones: ['Launch', 'Translunar Injection', 'Earth Return'],
        objectives: ['Test Orion', 'Deep Space Nav', 'Human Health'],
        metrics: [{ label: 'Crew', value: '4' }, { label: 'Duration', value: '10 Days' }, { label: 'Range', value: 'Moon' }],
        discoveries: [
            { title: 'Deep Space Radiation', description: 'Validating shielding for long-duration missions.' },
            { title: 'Optical Comms', description: 'Testing high-bandwidth laser communications from the Moon.' }
        ],
        archive: {
            papers: [
                { title: "Artemis II: The First Crewed Mission to the Moon in 50 Years", source: "NASA Technical Memorandum", url: "https://www.nasa.gov/specials/artemis/" },
                { title: "Orion Spacecraft Life Support Systems Validation", source: "ICES Proceedings", url: "https://www.nasa.gov/humans-in-space/orion-spacecraft/" },
                { title: "Trajectory Design for Artemis II", source: "AIAA Scitech", url: "https://arc.aiaa.org/" }
            ],
            links: [
                { label: "Artemis II Mission Page", type: "EXTERNAL", url: "https://www.nasa.gov/mission/artemis-ii/" },
                { label: "Orion Vehicle Overview", type: "DATA", url: "https://www.nasa.gov/exploration/systems/orion/index.html" },
                { label: "Crew Profiles", type: "MEDIA", url: "https://www.nasa.gov/specials/artemis-ii/" }
            ],
            updates: [
                { date: "2024-01-09", headline: "Schedule Update", snippet: "NASA adjusts target launch date to ensure highest safety standards for crew." },
                { date: "2023-04-03", headline: "Crew Announcement", snippet: "NASA names Reid Wiseman, Victor Glover, Christina Koch, and Jeremy Hansen as the crew." },
                { date: "2023-01-01", headline: "Hardware Assembly", snippet: "Technicians join the Orion crew module and service module adapter." }
            ]
        }
    },
    {
        id: 'dragonfly', name: 'Dragonfly', year: '2027', status: 'FUTURE',
        description: 'A rotorcraft lander mission to study the prebiotic chemistry of Titan, Saturn\'s largest moon.',
        image: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?q=80&w=1000&auto=format&fit=crop',
        milestones: ['Launch 2027', 'Titan Arrival 2034', 'First Flight'],
        objectives: ['Prebiotic Chem', 'Habitability', 'Search for Life'],
        metrics: [{ label: 'Rotors', value: '8' }, { label: 'Range', value: '175 km' }, { label: 'Power', value: 'MMRTG' }],
        discoveries: [
            { title: 'Prebiotic Chemistry', description: 'Study how far chemistry progressed in Titan\'s environment.' },
            { title: 'Atmospheric Dynamics', description: 'Measuring methane cycle and weather patterns.' }
        ],
        archive: {
            papers: [
                { title: "Dragonfly: A Rotorcraft Lander to Investigate Titan", source: "Space Science Reviews", url: "https://dragonfly.jhuapl.edu/" },
                { title: "Aerodynamics of Rotorcraft Flight on Titan", source: "AIAA Journal", url: "https://arc.aiaa.org/doi/10.2514/1.J059392" },
                { title: "Mass Spectrometry on the Surface of Titan", source: "Planetary Science Journal", url: "https://iopscience.iop.org/journal/2632-3338" }
            ],
            links: [
                { label: "JHUAPL Dragonfly Home", type: "EXTERNAL", url: "https://dragonfly.jhuapl.edu/" },
                { label: "NASA Solar System Exploration", type: "DATA", url: "https://science.nasa.gov/mission/dragonfly/" },
                { label: "Titan Flyover Simulation", type: "MEDIA", url: "https://dragonfly.jhuapl.edu/Gallery/" }
            ],
            updates: [
                { date: "2024-04-16", headline: "Nuclear Power Source", snippet: "Mission confirmed to use Multi-Mission Radioisotope Thermoelectric Generator (MMRTG)." },
                { date: "2023-11-28", headline: "Preliminary Design Review", snippet: "Dragonfly team passes critical milestone, clearing the way for final design and fabrication." },
                { date: "2021-09-01", headline: "Wind Tunnel Testing", snippet: "Scale models tested in heavy gas environments to simulate Titan's atmosphere." }
            ]
        }
    },
    {
        id: 'mars_colony', name: 'Mars Colony', year: '2040', status: 'FUTURE',
        description: 'The ambitious goal of establishing a permanent human settlement on the Red Planet.',
        image: 'https://images.unsplash.com/photo-1614728404402-3c6628b05423?q=80&w=1000&auto=format&fit=crop',
        milestones: ['First Cargo', 'ISRU Setup', 'First Humans'],
        objectives: ['Self-sufficiency', 'Terraforming', 'Multi-planetary'],
        metrics: [{ label: 'Pop', value: 'Initial 100' }, { label: 'Gravity', value: '38%' }, { label: 'Trip', value: '6 Mos' }],
        discoveries: [
            { title: 'ISRU Technology', description: 'Creating fuel and oxygen from Martian atmosphere.' },
            { title: 'Human Adaptation', description: 'Long-term physiological effects of low gravity.' }
        ],
        archive: {
            papers: [
                { title: "Human Exploration of Mars Design Reference Architecture 5.0", source: "NASA SP-2009-566", url: "https://www.nasa.gov/pdf/373665main_NASA-SP-2009-566.pdf" },
                { title: "Sustaining Life on Mars: ISRU Technologies", source: "Frontiers in Astronomy", url: "https://www.frontiersin.org/journals/astronomy-and-space-sciences" },
                { title: "Making Humans a Multi-Planetary Species", source: "New Space Journal", url: "https://www.liebertpub.com/doi/10.1089/space.2017.29009.emu" }
            ],
            links: [
                { label: "NASA Moon to Mars", type: "EXTERNAL", url: "https://www.nasa.gov/moon-to-mars/" },
                { label: "SpaceX Starship Updates", type: "DATA", url: "https://www.spacex.com/vehicles/starship/" },
                { label: "Mars Habitat Challenge", type: "MEDIA", url: "https://www.nasa.gov/competitions/3d-printed-habitat-challenge/" }
            ],
            updates: [
                { date: "2024-03-14", headline: "Starship Flight Test 3", snippet: "Successful orbital insertion demonstration brings heavy lift capability closer." },
                { date: "2023-04-20", headline: "MOXIE Success", snippet: "NASA experiment successfully generates breathable oxygen from Martian atmosphere." },
                { date: "2022-09-15", headline: "Radiation Shielding", snippet: "New materials tested for protecting future habitats from cosmic rays." }
            ]
        }
    },
    {
        id: 'luvex', name: 'LUVOIR-B', year: '2045', status: 'FUTURE',
        description: 'Large UV/Optical/IR Surveyor designed to find Earth-like exoplanets and biosignatures.',
        image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop',
        milestones: ['Concept', 'Construction', 'First Light'],
        objectives: ['Habitable Worlds', 'Cosmic Origins', 'Solar System'],
        metrics: [{ label: 'Aperture', value: '8 m' }, { label: 'Spectra', value: 'High Res' }, { label: 'Orbit', value: 'L2' }],
        discoveries: [
            { title: 'Biosignatures', description: 'Searching for oxygen and methane in exoplanet atmospheres.' },
            { title: 'Solar System Analogs', description: 'Imaging other planetary systems directly.' }
        ],
        archive: {
            papers: [
                { title: "LUVOIR Final Report", source: "NASA GSFC", url: "https://luvoir.gsfc.nasa.gov/reports/" },
                { title: "Habitable Worlds Observatory Concept", source: "National Academies Decadal", url: "https://science.nasa.gov/astrophysics/programs/habitable-worlds-observatory/" },
                { title: "Coronagraphy for Exoplanet Imaging", source: "SPIE Digital Library", url: "https://spie.org/" }
            ],
            links: [
                { label: "LUVOIR Mission Concept", type: "EXTERNAL", url: "https://luvoir.gsfc.nasa.gov/" },
                { label: "Exoplanet Exploration", type: "DATA", url: "https://exoplanets.nasa.gov/" },
                { label: "Technology Roadmap", type: "MEDIA", url: "https://apd440.gsfc.nasa.gov/technology.html" }
            ],
            updates: [
                { date: "2024-01-10", headline: "HWO Development", snippet: "NASA establishes the GOMAP program to mature technologies for the Habitable Worlds Observatory." },
                { date: "2023-06-05", headline: "Mirror Tech", snippet: "New ultra-stable composite mirrors pass cryogenic deformation tests." },
                { date: "2021-11-04", headline: "Decadal Survey", snippet: "Astro2020 recommends a large IR/Optical/UV telescope as the top priority flagship." }
            ]
        }
    },
];

const LazyImage = memo(({ src, alt }: { src: string, alt: string }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="w-full h-full relative overflow-hidden bg-space-900">
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-space-800 via-space-700 to-space-800 animate-pulse" />
            )}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-space-900/90 via-transparent to-transparent pointer-events-none" />
        </div>
    );
});

const MissionNode = memo(({ mission, onClick, isSelected, index }: {
    mission: Mission;
    onClick: (m: Mission) => void;
    isSelected: boolean;
    index: number;
}) => {
    return (
        <motion.div
            className="relative group shrink-0 snap-center pt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <motion.div
                className={`absolute top-[40px] left-1/2 w-0.5 bg-gradient-to-b from-transparent ${mission.status === 'FUTURE' ? 'to-purple-500/50' : mission.status === 'CURRENT' ? 'to-cyan-500/50' : 'to-gray-500/50'}`}
                initial={{ height: 0 }}
                animate={{ height: 30 }}
                transition={{ delay: 0.5 + index * 0.1 }}
            />

            <div className={`absolute -top-0 left-1/2 -translate-x-1/2 font-mono text-sm tracking-wider font-bold transition-colors duration-300 ${isSelected ? 'text-white scale-110' : mission.status === 'FUTURE' ? 'text-purple-400' : 'text-cyan-400'}`}>
                {mission.year}
            </div>

            <motion.button
                onClick={() => onClick(mission)}
                whileHover={{ scale: 1.2, boxShadow: "0 0 25px currentColor" }}
                whileTap={{ scale: 0.9 }}
                animate={{
                    scale: isSelected ? 1.3 : 1,
                    backgroundColor: isSelected ? "#ffffff" : "#0B0D17"
                }}
                className={`w-4 h-4 rounded-full border-[3px] z-10 relative transition-colors duration-300
                    ${mission.status === 'PAST' ? 'border-gray-500 text-gray-500' : ''}
                    ${mission.status === 'CURRENT' ? 'border-cyan-500 text-cyan-500' : ''}
                    ${mission.status === 'FUTURE' ? 'border-purple-500 text-purple-500' : ''}
                `}
            />

            <div className="absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center opacity-70 group-hover:opacity-100 transition-opacity">
                <p className={`font-display font-bold text-sm transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    {mission.name}
                </p>
            </div>
        </motion.div>
    );
});

const MissionTimeline: React.FC = () => {
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAST' | 'CURRENT' | 'FUTURE'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [aiInsight, setAiInsight] = useState('');
    const [isInsightLoading, setIsInsightLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'BRIEF' | 'ARCHIVE'>('BRIEF');

    const filteredMissions = useMemo(() => {
        return MISSIONS.filter(mission => {
            let matchesStatus = false;

            if (filterStatus === 'ALL') {
                matchesStatus = true;
            } else if (filterStatus === 'PAST') {
                matchesStatus = mission.status === 'PAST';
            } else if (filterStatus === 'CURRENT') {
                matchesStatus = mission.status === 'CURRENT';
            } else if (filterStatus === 'FUTURE') {
                matchesStatus = mission.status === 'FUTURE';
            }

            const matchesSearch = mission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mission.year.includes(searchQuery);
            return matchesStatus && matchesSearch;
        });
    }, [filterStatus, searchQuery]);

    const handleMissionSelect = useCallback((mission: Mission) => {
        setSelectedMission(mission);
        setViewMode('BRIEF');
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedMission(null);
    }, []);

    useEffect(() => {
        if (selectedMission) {
            setAiInsight('');
            setIsInsightLoading(true);
            generateMissionInsight(selectedMission.name, selectedMission.description)
                .then(insight => setAiInsight(insight))
                .catch(err => setAiInsight("Analysis unavailable."))
                .finally(() => setIsInsightLoading(false));
        }
    }, [selectedMission]);

    return (
        <div className="flex flex-col h-full w-full overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shrink-0 gap-4">
                <motion.h2
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-3xl font-display font-bold text-white border-l-4 border-cyan-500 pl-4 uppercase tracking-widest"
                >
                    Mission Chronology
                </motion.h2>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Search mission ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-space-800 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 w-full md:w-64 transition-all"
                        />
                    </div>

                    <div className="flex bg-space-800 rounded-full p-1 border border-white/10">
                        {['ALL', 'PAST', 'CURRENT', 'FUTURE'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as any)}
                                className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all relative ${filterStatus === status ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                {filterStatus === status && (
                                    <motion.div
                                        layoutId="status-filter-pill"
                                        className="absolute inset-0 bg-cyan-600 rounded-full shadow-lg -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Timeline Area */}
            <div className="relative w-full overflow-x-auto pb-12 custom-scrollbar hide-scrollbar shrink-0 snap-x snap-mandatory min-h-[220px]">
                <div className="relative flex items-center gap-24 px-24 min-w-max h-full pt-4">
                    <div className="absolute top-[82px] left-0 right-0 h-[1px] bg-white/5 -translate-y-1/2 rounded-full pointer-events-none" />
                    {filteredMissions.length > 0 ? (
                        filteredMissions.map((mission, index) => (
                            <MissionNode
                                key={mission.id}
                                mission={mission}
                                index={index}
                                onClick={handleMissionSelect}
                                isSelected={selectedMission?.id === mission.id}
                            />
                        ))
                    ) : (
                        <div className="absolute left-12 text-gray-500 italic font-mono text-xs uppercase tracking-widest">No matching mission data in database</div>
                    )}
                </div>
            </div>

            {/* Modal Popup Detail Card Overlay */}
            <AnimatePresence>
                {selectedMission && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={clearSelection}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm cursor-pointer"
                    >
                        <motion.div
                            key={selectedMission.id}
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl max-h-[90vh] bg-space-800/95 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.8)] cursor-default"
                        >
                            {/* Independent Scroll Container inside the popup */}
                            <div className="flex flex-col md:flex-row w-full overflow-y-auto custom-scrollbar">

                                {/* Left: Visuals & Title */}
                                <div className="md:w-2/5 shrink-0 border-r border-white/5 bg-space-900/40">
                                    <div className="aspect-video md:aspect-square relative overflow-hidden">
                                        <LazyImage src={selectedMission.image} alt={selectedMission.name} />
                                        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-space-900 via-space-900/40 to-transparent">
                                            <motion.h3
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="text-5xl font-display font-black text-white mb-2 leading-none uppercase tracking-tighter"
                                            >
                                                {selectedMission.name}
                                            </motion.h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-cyan-400 font-mono font-bold tracking-[0.2em] text-sm uppercase">{selectedMission.year}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest border border-white/10 ${selectedMission.status === 'FUTURE' ? 'bg-purple-500/20 text-purple-400' : selectedMission.status === 'CURRENT' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                    {selectedMission.status} Mission
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <p className="text-gray-300 text-sm leading-relaxed font-medium">
                                            {selectedMission.description}
                                        </p>

                                        {/* AI Insight Section */}
                                        <div className="p-5 rounded-xl bg-purple-900/10 border border-purple-500/20 relative overflow-hidden">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_5px_#a855f7]" />
                                                <h4 className="text-purple-400 text-[10px] font-black uppercase tracking-[0.3em]">AI Strategic Intel</h4>
                                            </div>
                                            {isInsightLoading ? (
                                                <div className="flex gap-1 h-4 items-center">
                                                    <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            ) : (
                                                <p className="text-xs text-purple-100 font-bold italic leading-relaxed">
                                                    "{aiInsight}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedMission.metrics.map((metric, idx) => (
                                                <div key={idx} className="bg-black/30 p-3 rounded-lg border border-white/5">
                                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">{metric.label}</div>
                                                    <div className="text-lg font-display text-white font-black">{metric.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Technical Objectives & Timeline */}
                                <div className="flex-1 p-8 md:p-12 space-y-12">
                                    {viewMode === 'BRIEF' ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-12"
                                        >
                                            <div className="grid grid-cols-1 gap-12">
                                                {/* Objectives */}
                                                <section>
                                                    <h4 className="flex items-center gap-3 text-cyan-400 text-sm font-black uppercase tracking-[0.3em] mb-6 border-b border-cyan-500/20 pb-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Mission Objectives
                                                    </h4>
                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {selectedMission.objectives.map((obj, i) => (
                                                            <li key={i} className="flex items-start gap-3 text-gray-300 text-xs font-medium bg-white/5 p-3 rounded-lg border border-white/5">
                                                                <span className="w-1 h-1 bg-cyan-400 rounded-full mt-1.5 shrink-0" />
                                                                {obj}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </section>

                                                {/* Milestones */}
                                                <section>
                                                    <h4 className="flex items-center gap-3 text-purple-400 text-sm font-black uppercase tracking-[0.3em] mb-6 border-b border-purple-500/20 pb-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Chronological Milestones
                                                    </h4>
                                                    <div className="relative border-l border-white/10 ml-3 space-y-8 pb-4">
                                                        {selectedMission.milestones.map((mile, i) => (
                                                            <div key={i} className="relative pl-8 group">
                                                                <div className="absolute -left-1.5 top-1 w-3 h-3 bg-space-800 border-2 border-purple-500 rounded-full group-hover:bg-purple-500 transition-colors" />
                                                                <p className="text-xs text-white font-bold tracking-wide">{mile}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>

                                                {/* Discoveries */}
                                                <section>
                                                    <h4 className="flex items-center gap-3 text-white text-sm font-black uppercase tracking-[0.3em] mb-6 border-b border-white/10 pb-2">
                                                        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                                        Scientific Analysis
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {selectedMission.discoveries.map((discovery, idx) => (
                                                            <div key={idx} className="bg-black/20 p-5 rounded-xl border border-white/5 group hover:border-yellow-500/30 transition-all">
                                                                <h5 className="font-display text-cyan-400 text-xs font-black uppercase mb-2 group-hover:text-yellow-400 transition-colors">{discovery.title}</h5>
                                                                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{discovery.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            </div>

                                            <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                                                <span className="text-[9px] text-gray-600 font-mono font-bold uppercase tracking-widest">End of file dossier // ID: {selectedMission.id}</span>
                                                <button
                                                    onClick={() => setViewMode('ARCHIVE')}
                                                    className="px-8 py-3 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/50 rounded text-cyan-400 hover:text-white font-display font-black tracking-[0.2em] transition-all text-xs flex items-center gap-3"
                                                >
                                                    ACCESS FULL ARCHIVE
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-10"
                                        >
                                            {/* Archive Header */}
                                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                                <h4 className="flex items-center gap-3 text-cyan-400 text-sm font-black uppercase tracking-[0.3em]">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                    Mission Archive
                                                </h4>
                                                <button
                                                    onClick={() => setViewMode('BRIEF')}
                                                    className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest font-bold flex items-center gap-2 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                                                    Return to Brief
                                                </button>
                                            </div>

                                            {/* 1. Research Papers */}
                                            <section>
                                                <h5 className="text-white text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Research Papers
                                                </h5>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {selectedMission.archive.papers.map((paper, i) => (
                                                        <a
                                                            key={i}
                                                            href={paper.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all cursor-pointer group block"
                                                        >
                                                            <div>
                                                                <div className="text-gray-200 text-xs font-mono font-bold group-hover:text-white">{paper.title}</div>
                                                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{paper.source}</div>
                                                            </div>
                                                            <svg className="w-4 h-4 text-blue-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        </a>
                                                    ))}
                                                </div>
                                            </section>

                                            {/* 2. Official Data Links */}
                                            <section>
                                                <h5 className="text-white text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Mission Data
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {selectedMission.archive.links.map((link, i) => (
                                                        <a
                                                            key={i}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 bg-black/20 p-3 rounded border border-white/5 hover:border-green-500/30 transition-colors cursor-pointer group block"
                                                        >
                                                            <div className="p-2 bg-green-500/10 rounded text-green-400 group-hover:bg-green-500 group-hover:text-black transition-colors">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                                                            </div>
                                                            <div>
                                                                <div className="text-[11px] text-white font-bold">{link.label}</div>
                                                                <div className="text-[9px] text-green-500/80 font-mono uppercase">{link.type}</div>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </section>

                                            {/* 3. Mission Updates */}
                                            <section>
                                                <h5 className="text-white text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Transmission Log
                                                </h5>
                                                <div className="space-y-4">
                                                    {selectedMission.archive.updates.map((update, i) => (
                                                        <div key={i} className="relative pl-6 border-l border-white/10 group">
                                                            <div className="absolute left-[-3px] top-1.5 w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-yellow-500 transition-colors" />
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors">{update.headline}</span>
                                                                <span className="text-[9px] font-mono text-gray-500">{update.date}</span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 leading-relaxed">{update.snippet}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Fixed Close Icon */}
                            <button
                                onClick={clearSelection}
                                className="absolute top-6 right-6 p-2 bg-black/50 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all z-50 border border-white/10"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Prompt when no mission selected */}
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600/40 border-2 border-dashed border-white/5 rounded-2xl bg-space-900/10 mt-4">
                <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-mono text-xs tracking-[0.4em] uppercase font-bold animate-pulse-slow">Awaiting mission selection for neural uplink</p>
            </div>
        </div>
    );
};

export default MissionTimeline;