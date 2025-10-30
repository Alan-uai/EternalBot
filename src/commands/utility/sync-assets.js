// src/commands/utility/sync-assets.js
import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { v2 as cloudinary } from 'cloudinary';
import { doc, setDoc } from 'firebase/firestore';

export const data = new SlashCommandBuilder()
    .setName('sync-assets')
    .setDescription('Sincroniza os assets do Cloudinary com o Firestore.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

export async function execute(interaction, container) {
    const { logger, config, services } = container;
    const { firestore } = services.firebase;

    if (!interaction.member.roles.cache.has(config.ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    if (!process.env.CLOUDINARY_URL) {
        return interaction.reply({
            content: 'A variável de ambiente CLOUDINARY_URL não está configurada. A sincronização não pode continuar.',
            ephemeral: true,
        });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
        cloudinary.config({ secure: true });

        const result = await cloudinary.api.resources({
            type: 'upload',
            max_results: 500, // Aumentar limite se necessário
            prefix: 'eternal-bot-assets/' // Especifica a pasta a ser buscada
        });

        const assetIds = result.resources.map(res => {
            // Remove a pasta e a extensão do public_id para ter um ID limpo
            // ex: 'eternal-bot-assets/EasyA' se torna 'EasyA'
            return res.public_id.replace(/^eternal-bot-assets\//, '');
        });

        if (assetIds.length === 0) {
            return interaction.editReply('Nenhum asset encontrado na pasta `eternal-bot-assets` do Cloudinary.');
        }

        const assetIdsDocRef = doc(firestore, 'bot_config', 'asset_ids');
        await setDoc(assetIdsDocRef, {
            ids: assetIds,
            lastSynced: new Date().toISOString(),
        });
        
        // Recarrega o serviço de assets no container para refletir as mudanças imediatamente
        if (services.firebase.assetService) {
            await services.firebase.assetService.initialize(logger);
        }

        await interaction.editReply(`Sincronização concluída com sucesso! ${assetIds.length} assets foram encontrados e salvos no Firestore.`);

    } catch (error) {
        logger.error('Erro ao sincronizar assets do Cloudinary:', error);
        await interaction.editReply('Ocorreu um erro ao tentar sincronizar os assets. Verifique as credenciais do Cloudinary e os logs.');
    }
}
