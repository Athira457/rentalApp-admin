import Typesense from 'typesense';

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: '059sa1ztl6hjdouwp-1.a1.typesense.net',
      port:  443,
      protocol: 'https',
    },
  ],
  apiKey: 'iwsLoaNdi59hCTA64c74UjAQOIRVmxYM',
  connectionTimeoutSeconds: 20,
});

export default typesenseClient;