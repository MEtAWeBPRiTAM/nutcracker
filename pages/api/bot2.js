// pages/api/bot2.js

import bot2 from '../../lib/bot2Logic';

export default function handler(req, res) {
  bot2.processUpdate(req.body);
  res.status(200).end();
}
