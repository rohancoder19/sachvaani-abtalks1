import { connectDatabase } from './config/database';
import { PersonaModel } from './models/persona.model';
import { TopicModel } from './models/topic.model';
import { PostModel } from './models/post.model';
import { MemoryModel } from './models/memory.model';
import { SchedulerModel } from './models/scheduler.model';
import { aiClientService } from './services/aiClient.service';
import { logger } from './config/logger';
import mongoose from 'mongoose';

async function seedAutonomousCycle() {
  try {
    await connectDatabase();
    logger.info('🌱 Starting autonomous database seeding cycle...');

    // 1. Ensure Active Persona exists
    let persona = await PersonaModel.findOne({ isActive: true });
    if (!persona) {
      persona = await PersonaModel.create({
        userId: new mongoose.Types.ObjectId(),
        name: 'Autonomous AI Creator',
        domain: 'Artificial Intelligence & Technology',
        voiceStyle: 'Authoritative, Insightful, Tech-Focused',
        targetAudience: 'Developers, Engineers, AI Researchers',
        isActive: true
      });
      logger.info(`✨ Created default Persona: ${persona.name}`);
    }

    // 2. Execute Python AI Pipeline to fetch live topics & generate post
    logger.info('🤖 Executing AI Service live topic discovery & scoring cycle...');
    const aiResult = await aiClientService.triggerAutonomousCycle(persona._id.toString());
    const aiData = aiResult?.data;

    if (!aiData) {
      throw new Error('No data returned from AI service');
    }

    // 3. Populate Topic Candidates into MongoDB
    let savedTopicsCount = 0;
    if (aiData.evaluatedTopics && Array.isArray(aiData.evaluatedTopics)) {
      for (const top of aiData.evaluatedTopics) {
        await TopicModel.findOneAndUpdate(
          { urlHash: top.urlHash },
          {
            personaId: persona._id,
            title: top.title,
            summary: top.summary,
            source: top.source,
            url: top.url,
            urlHash: top.urlHash,
            score: top.score,
            status: top.status,
            rejectionReason: top.rejectionReason
          },
          { upsert: true }
        );
        savedTopicsCount++;
      }
    }
    logger.info(`✅ Saved ${savedTopicsCount} evaluated topic candidates to MongoDB.`);

    // 4. Save Published Post
    if (aiData.topic && aiData.post) {
      const topicDoc = await TopicModel.findOne({ urlHash: aiData.topic.urlHash });
      const post = await PostModel.create({
        personaId: persona._id,
        topicId: topicDoc?._id,
        text: aiData.post.text,
        rationale: aiData.post.rationale,
        sources: aiData.post.sources,
        tags: aiData.post.tags,
        metrics: { views: 42, shares: 7, likes: 18 }
      });
      logger.info(`✅ Created Published AI Post ID: ${post._id}`);

      // 5. Save Vector Memory Entry
      if (aiData.embedding) {
        await MemoryModel.create({
          personaId: persona._id,
          postId: post._id,
          summary: aiData.topic.title,
          keywords: aiData.post.tags || ['AI', 'TechNews'],
          embeddings: aiData.embedding
        });
        logger.info(`✅ Saved 1536-dim Vector Memory log for Post ID: ${post._id}`);
      }
    }

    // 6. Update Scheduler Log
    await SchedulerModel.findOneAndUpdate(
      { personaId: persona._id },
      {
        personaId: persona._id,
        cronExpression: '*/30 * * * *',
        intervalMinutes: 30,
        status: 'IDLE',
        nextRunAt: new Date(Date.now() + 30 * 60 * 1000),
        $inc: { totalRuns: 1, successfulRuns: 1 }
      },
      { upsert: true }
    );

    logger.info('🎉 Autonomous Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedAutonomousCycle();
